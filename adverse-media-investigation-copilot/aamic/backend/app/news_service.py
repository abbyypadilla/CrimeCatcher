"""
News retrieval service.

Pulls candidate adverse-media articles for a query from Google News RSS
(no API key required). Falls back gracefully - returning an empty list -
if the request fails or the network is unavailable; the caller (ai_service)
decides whether to fill in with mock articles.

Optionally also queries NewsAPI.org if NEWSAPI_KEY is set in the
environment, merging and deduplicating results across both sources.
"""

from __future__ import annotations

import os
import re
import xml.etree.ElementTree as ET
from typing import List
from urllib.parse import quote_plus

import httpx

from .models import Article

GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

REQUEST_TIMEOUT = 8.0


def _strip_html(text: str) -> str:
    """Google News RSS descriptions are HTML snippets - strip tags for a clean summary."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _normalize_title(title: str) -> str:
    """Normalize a headline for dedup comparison (lowercase, strip punctuation/source suffix)."""
    title = re.split(r"\s[-|]\s", title)[0]  # Google News often appends "- Source Name"
    title = re.sub(r"[^a-z0-9\s]", "", title.lower())
    return re.sub(r"\s+", " ", title).strip()


def fetch_google_news_rss(query: str, max_results: int = 12) -> List[Article]:
    """Fetch and parse Google News RSS results for a query."""
    url = GOOGLE_NEWS_RSS_URL.format(query=quote_plus(query))
    try:
        response = httpx.get(url, timeout=REQUEST_TIMEOUT, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (AdverseMediaCopilot/1.0)"
        })
        response.raise_for_status()
    except (httpx.HTTPError, httpx.TimeoutException):
        return []

    try:
        root = ET.fromstring(response.text)
    except ET.ParseError:
        return []

    articles: List[Article] = []
    for item in root.findall("./channel/item")[:max_results]:
        title_el = item.find("title")
        link_el = item.find("link")
        pub_date_el = item.find("pubDate")
        desc_el = item.find("description")
        source_el = item.find("source")

        title = title_el.text if title_el is not None and title_el.text else "Untitled"
        link = link_el.text if link_el is not None and link_el.text else ""
        published = pub_date_el.text if pub_date_el is not None and pub_date_el.text else ""
        summary = _strip_html(desc_el.text) if desc_el is not None and desc_el.text else ""
        source = source_el.text if source_el is not None and source_el.text else "Google News"

        articles.append(Article(
            title=title,
            source=source,
            published_date=published,
            summary=summary or "No summary available from source feed.",
            link=link,
            content=None,
        ))

    return articles


def fetch_newsapi(query: str, max_results: int = 12) -> List[Article]:
    """Optional secondary source via NewsAPI.org, only used if NEWSAPI_KEY is configured."""
    api_key = os.getenv("NEWSAPI_KEY")
    if not api_key:
        return []

    try:
        response = httpx.get(
            NEWSAPI_URL,
            params={
                "q": query,
                "sortBy": "publishedAt",
                "language": "en",
                "pageSize": max_results,
                "apiKey": api_key,
            },
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, httpx.TimeoutException, ValueError):
        return []

    articles: List[Article] = []
    for item in data.get("articles", []):
        articles.append(Article(
            title=item.get("title") or "Untitled",
            source=(item.get("source") or {}).get("name", "NewsAPI"),
            published_date=item.get("publishedAt", ""),
            summary=item.get("description") or "No summary available.",
            link=item.get("url", ""),
            content=item.get("content"),
        ))
    return articles


def deduplicate_articles(articles: List[Article]) -> List[Article]:
    """Remove duplicate articles by normalized title and by exact link."""
    seen_titles = set()
    seen_links = set()
    deduped: List[Article] = []

    for article in articles:
        norm_title = _normalize_title(article.title)
        if (norm_title and norm_title in seen_titles) or (article.link and article.link in seen_links):
            continue
        seen_titles.add(norm_title)
        if article.link:
            seen_links.add(article.link)
        deduped.append(article)

    return deduped


def fetch_news(query: str, max_results: int = 12) -> List[Article]:
    """Fetch news from all configured sources, merge, and deduplicate."""
    combined = fetch_google_news_rss(query, max_results) + fetch_newsapi(query, max_results)
    return deduplicate_articles(combined)[:max_results]
