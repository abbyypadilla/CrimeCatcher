"""
AI analysis service.

Sends retrieved adverse-media articles to OpenAI and asks for a single
structured JSON object matching InvestigationReport. If no OPENAI_API_KEY
is configured, or the call fails for any reason, falls back to the
mock-data generator so the demo never breaks.
"""

from __future__ import annotations

import json
import logging
import os
from typing import List, Optional

from .models import Article, Entities, InvestigationReport, TimelineEvent
from .mock_data import generate_mock_investigation
from .risk_scoring import clamp_score, score_to_level

logger = logging.getLogger("ai_service")

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """You are a senior AML (Anti-Money Laundering) and financial crime investigator \
working at a global investment bank's Financial Crime Compliance unit.

You will be given a subject name and a set of news articles retrieved about that subject. \
Read all articles carefully and produce an adverse media investigation report.

Identify and weigh evidence of:
- Negative or reputationally damaging media coverage
- Financial crime (fraud, embezzlement)
- Money laundering
- Bribery and corruption
- Regulatory investigations or enforcement actions
- Sanctions exposure
- Executive misconduct, arrest, or indictment
- Tax fraud
- Cybercrime
- Shell company / opaque ownership structures

Extract named entities mentioned across the articles:
- people
- companies
- countries
- banks
- government agencies

Produce:
- A concise, professional executive summary (4-8 sentences) written the way an AML analyst \
would write it for a case file. Be factual and attribute claims appropriately (e.g. "according to \
[source]..."); do not invent facts not supported by the articles.
- A risk score from 0-100 using this rubric:
  - 90-100: confirmed fraud, executive arrest/conviction, sanctions, money laundering
  - 70-89: active regulatory investigation, accounting irregularities, tax fraud allegations
  - 40-69: negative media coverage, civil lawsuits, minor violations
  - 0-39: no significant adverse findings
- A confidence score from 0-100 reflecting how much corroborating evidence the articles provide \
(more independent, reputable sources covering consistent facts = higher confidence).
- A chronological timeline of the most significant events, each with a year/date, short title, \
1-2 sentence description, and severity (low|medium|high).
- A list of risk indicator flags drawn ONLY from this controlled vocabulary: \
"Accounting Fraud", "Money Laundering", "Bribery", "Shell Company", "Cybercrime", \
"Sanctions Exposure", "Regulatory Investigation", "Executive Arrest", "Tax Fraud", "Corruption". \
Only include flags that are actually supported by the articles.
- A recommendation, exactly one of: "Approve", "Review", "Enhanced Due Diligence", "Escalate", "Reject", \
plus 1-3 sentences of reasoning grounded in the evidence.

If the articles contain little or no adverse information, say so plainly, assign a low risk score, \
and recommend "Approve". Do not fabricate allegations that are not supported by the source material.

Respond with ONLY a single valid JSON object (no markdown fences, no commentary) with exactly this shape:

{
  "company": string,
  "risk_score": integer 0-100,
  "confidence": integer 0-100,
  "summary": string,
  "timeline": [ { "year": string, "title": string, "description": string, "severity": "low"|"medium"|"high" } ],
  "entities": {
    "people": [string], "companies": [string], "countries": [string],
    "banks": [string], "government_agencies": [string]
  },
  "flags": [string],
  "recommendation": string,
  "recommendation_reasoning": string
}
"""


def _build_user_prompt(query: str, articles: List[Article]) -> str:
    if not articles:
        return (
            f"Subject: {query}\n\n"
            "No news articles were retrieved for this subject. Produce a report reflecting the "
            "absence of adverse media findings, with a low risk score and an 'Approve' "
            "recommendation, while noting that coverage may simply be limited."
        )

    parts = [f"Subject: {query}\n\nArticles ({len(articles)}):\n"]
    for i, article in enumerate(articles, start=1):
        parts.append(
            f"[{i}] Title: {article.title}\n"
            f"Source: {article.source} | Published: {article.published_date}\n"
            f"Summary: {article.summary}\n"
        )
    return "\n".join(parts)


def _parse_ai_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    return json.loads(cleaned)


def _call_openai(query: str, articles: List[Article]) -> Optional[dict]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    try:
        from openai import OpenAI  # imported lazily so the package is only required if a key is set
    except ImportError:
        logger.warning("openai package not installed; falling back to mock mode.")
        return None

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=MODEL_NAME,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(query, articles)},
            ],
        )
        raw_text = response.choices[0].message.content
        return _parse_ai_json(raw_text)
    except Exception as exc:  # noqa: BLE001 - any failure here should gracefully degrade to mock mode
        logger.exception("OpenAI call failed, falling back to mock mode: %s", exc)
        return None


def analyze(query: str, articles: List[Article]) -> InvestigationReport:
    """Run AI analysis over retrieved articles, falling back to mock data on any failure."""
    ai_json = _call_openai(query, articles)

    if ai_json is None:
        return generate_mock_investigation(query, real_articles=articles or None)

    try:
        score = clamp_score(int(ai_json.get("risk_score", 0)))
        entities_data = ai_json.get("entities") or {}
        report = InvestigationReport(
            company=ai_json.get("company") or query,
            risk_score=score,
            risk_level=score_to_level(score),
            confidence=max(0, min(100, int(ai_json.get("confidence", 50)))),
            summary=ai_json.get("summary", ""),
            timeline=[TimelineEvent(**t) for t in ai_json.get("timeline", [])],
            entities=Entities(
                people=entities_data.get("people", []),
                companies=entities_data.get("companies", []),
                countries=entities_data.get("countries", []),
                banks=entities_data.get("banks", []),
                government_agencies=entities_data.get("government_agencies", []),
            ),
            flags=ai_json.get("flags", []),
            articles=articles,
            recommendation=ai_json.get("recommendation", "Review"),
            recommendation_reasoning=ai_json.get("recommendation_reasoning", ""),
            is_mock=False,
        )
        return report
    except Exception as exc:  # noqa: BLE001 - malformed AI output should still degrade gracefully
        logger.exception("Failed to parse AI response into report schema: %s", exc)
        return generate_mock_investigation(query, real_articles=articles or None)
