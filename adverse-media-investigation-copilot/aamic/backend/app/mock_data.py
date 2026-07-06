"""
Mock investigation generator.

Used whenever there is no OPENAI_API_KEY configured (or the OpenAI call
fails), so the demo keeps working end-to-end without any external
dependency. A handful of well-known financial-crime cases get bespoke,
realistic data; anything else falls back to a randomized-but-plausible
generic investigation built from the query string and (optionally) the
real headlines that were retrieved from Google News RSS.
"""

from __future__ import annotations

import hashlib
import random
from typing import Dict, List, Optional

from .models import Article, Entities, InvestigationReport, TimelineEvent
from .risk_scoring import score_to_level

# ---------------------------------------------------------------------------
# Curated cases - used when the query matches a well known adverse-media
# story, so the hackathon demo can show a convincing "real" example.
# ---------------------------------------------------------------------------

_CURATED_CASES: Dict[str, dict] = {
    "wirecard": {
        "company": "Wirecard AG",
        "risk_score": 96,
        "confidence": 94,
        "summary": (
            "Wirecard AG, formerly a DAX-listed German payments processor, collapsed in 2020 "
            "after disclosing that EUR 1.9 billion held in trustee accounts in the Philippines "
            "did not exist. Investigators allege a years-long accounting fraud designed to "
            "inflate revenue and balance sheet assets. Former CEO Markus Braun was arrested and "
            "charged with fraud and market manipulation, while COO Jan Marsalek remains a "
            "fugitive believed to be in Russia. The case is one of the largest corporate fraud "
            "scandals in German post-war history and triggered regulatory reform of BaFin."
        ),
        "flags": [
            "Accounting Fraud",
            "Executive Arrest",
            "Regulatory Investigation",
            "Shell Company",
            "Corruption",
        ],
        "timeline": [
            {"year": "2015", "title": "Short-seller allegations begin", "description": "Analysts and short-sellers first publish reports questioning Wirecard's Asian revenue figures.", "severity": "medium"},
            {"year": "2019", "title": "FT investigation published", "description": "Financial Times reporting alleges systematic accounting irregularities at Wirecard's Asia-Pacific division.", "severity": "high"},
            {"year": "2020", "title": "EUR 1.9bn missing, insolvency filed", "description": "Auditor EY refuses to sign off on accounts; Wirecard admits the trustee cash likely never existed and files for insolvency.", "severity": "high"},
            {"year": "2020", "title": "CEO Markus Braun arrested", "description": "Former CEO is arrested in Munich on suspicion of fraud and accounting manipulation.", "severity": "high"},
            {"year": "2022", "title": "Criminal trial begins in Munich", "description": "Braun and two co-defendants go on trial; COO Jan Marsalek remains at large.", "severity": "high"},
        ],
        "entities": {
            "people": ["Markus Braun", "Jan Marsalek", "Oliver Bellenhaus"],
            "companies": ["Wirecard AG", "Wirecard Bank", "EY (Ernst & Young)"],
            "countries": ["Germany", "Philippines", "Singapore", "Russia"],
            "banks": ["Wirecard Bank AG"],
            "government_agencies": ["BaFin", "Munich Public Prosecutor's Office"],
        },
        "recommendation": "Reject",
        "recommendation_reasoning": (
            "Confirmed large-scale accounting fraud, executive criminal charges, and an ongoing "
            "fugitive investigation make this an unacceptable financial-crime risk for onboarding "
            "or continued relationship."
        ),
    },
    "ftx": {
        "company": "FTX Trading Ltd.",
        "risk_score": 97,
        "confidence": 95,
        "summary": (
            "FTX, once the world's third-largest cryptocurrency exchange, collapsed in November "
            "2022 amid revelations that customer funds were improperly diverted to its affiliated "
            "trading firm, Alameda Research. Founder Sam Bankman-Fried was convicted in 2024 on "
            "multiple counts of fraud and conspiracy related to the misappropriation of an "
            "estimated USD 8 billion in customer assets."
        ),
        "flags": [
            "Money Laundering",
            "Executive Arrest",
            "Accounting Fraud",
            "Regulatory Investigation",
        ],
        "timeline": [
            {"year": "2022", "title": "CoinDesk reports balance sheet concerns", "description": "Leaked Alameda balance sheet raises questions about reliance on FTT tokens.", "severity": "medium"},
            {"year": "2022", "title": "Liquidity crisis and bankruptcy", "description": "Customer withdrawals overwhelm FTX; the firm files for Chapter 11 bankruptcy.", "severity": "high"},
            {"year": "2022", "title": "SBF arrested in the Bahamas", "description": "Founder Sam Bankman-Fried is arrested and later extradited to the United States.", "severity": "high"},
            {"year": "2024", "title": "Convicted on all counts", "description": "A federal jury convicts Bankman-Fried of fraud and conspiracy; he is later sentenced to 25 years.", "severity": "high"},
        ],
        "entities": {
            "people": ["Sam Bankman-Fried", "Caroline Ellison", "Gary Wang"],
            "companies": ["FTX Trading Ltd.", "Alameda Research"],
            "countries": ["United States", "Bahamas"],
            "banks": ["Silvergate Bank"],
            "government_agencies": ["SEC", "CFTC", "U.S. DOJ"],
        },
        "recommendation": "Reject",
        "recommendation_reasoning": (
            "Founder convicted of large-scale fraud and misappropriation of customer assets; "
            "entity is in bankruptcy proceedings. No viable risk appetite for onboarding."
        ),
    },
}


def _hash_seed(query: str) -> int:
    """Deterministic-but-varied seed so repeated searches for the same
    query return consistent (not randomly different) demo data."""
    return int(hashlib.sha256(query.lower().encode()).hexdigest(), 16) % (10**8)


_GENERIC_FLAG_POOL = [
    "Regulatory Investigation",
    "Accounting Fraud",
    "Money Laundering",
    "Bribery",
    "Shell Company",
    "Cybercrime",
    "Sanctions Exposure",
    "Executive Arrest",
    "Tax Fraud",
    "Corruption",
]

_GENERIC_PEOPLE = ["J. Whitfield (CFO)", "M. Alaoui (Director)", "R. Tanaka (Compliance Head)"]
_GENERIC_COMPANIES_SUFFIXES = ["Holdings Ltd.", "Group International", "Capital Partners", "Trading Co."]
_GENERIC_COUNTRIES = ["United States", "United Kingdom", "Cyprus", "United Arab Emirates", "Singapore"]
_GENERIC_BANKS = ["Meridian Trust Bank", "Northstar Commercial Bank", "Atlas International Bank"]
_GENERIC_AGENCIES = ["Financial Conduct Authority", "OFAC", "FinCEN", "Local Public Prosecutor"]

_RECOMMENDATIONS_BY_LEVEL = {
    "Low": ("Approve", "No material adverse media identified. Standard due diligence is sufficient."),
    "Medium": ("Review", "Some negative coverage and unresolved allegations warrant analyst review before proceeding."),
    "High": ("Enhanced Due Diligence", "Multiple credible adverse media flags require enhanced due diligence and senior sign-off before any relationship decision."),
}


def _build_generic_case(query: str, articles: Optional[List[dict]] = None) -> dict:
    rng = random.Random(_hash_seed(query))

    score = rng.randint(15, 92)
    level = score_to_level(score)
    confidence = rng.randint(72, 97)

    num_flags = 1 if level == "Low" else (rng.randint(2, 3) if level == "Medium" else rng.randint(3, 5))
    flags = rng.sample(_GENERIC_FLAG_POOL, k=min(num_flags, len(_GENERIC_FLAG_POOL)))

    years = [2022, 2023, 2024, 2025]
    timeline = []
    if level != "Low":
        chosen_years = sorted(rng.sample(years, k=min(len(years), 3)))
        templates = [
            ("Adverse media first reported", "Initial press coverage raises questions about {q}'s business practices.", "medium"),
            ("Regulatory inquiry opened", "A regulator opens a preliminary inquiry into {q}'s conduct.", "high"),
            ("Civil litigation filed", "Counterparties file civil suits alleging financial misconduct linked to {q}.", "medium"),
            ("Compliance findings reported", "Internal compliance review flags control weaknesses at {q}.", "low"),
        ]
        picks = rng.sample(templates, k=len(chosen_years))
        for year, (title, desc, sev) in zip(chosen_years, picks):
            timeline.append({
                "year": str(year),
                "title": title,
                "description": desc.format(q=query),
                "severity": sev,
            })

    company_name = query if any(c.isupper() for c in query) or len(query.split()) > 1 else query.title()

    summary = (
        f"Open-source research on \"{query}\" surfaced {len(flags)} adverse-media indicator(s) "
        f"of {level.lower()} concern. "
        + (
            "Coverage points to allegations that have not been independently confirmed by court "
            "filings or regulatory action; further verification is recommended before any "
            "decision is finalized."
            if level != "Low"
            else "No credible financial-crime allegations, sanctions exposure, or regulatory "
            "action were identified in the reviewed sources."
        )
    )

    entities = {
        "people": rng.sample(_GENERIC_PEOPLE, k=2) if level != "Low" else [],
        "companies": [company_name] + ([f"{company_name.split()[0]} {rng.choice(_GENERIC_COMPANIES_SUFFIXES)}"] if level != "Low" else []),
        "countries": rng.sample(_GENERIC_COUNTRIES, k=2) if level != "Low" else [rng.choice(_GENERIC_COUNTRIES)],
        "banks": rng.sample(_GENERIC_BANKS, k=1) if level == "High" else [],
        "government_agencies": rng.sample(_GENERIC_AGENCIES, k=2) if level != "Low" else [],
    }

    recommendation, reasoning = _RECOMMENDATIONS_BY_LEVEL[level]
    if level == "High" and score >= 90:
        recommendation, reasoning = (
            "Escalate",
            "Severity and credibility of findings exceed standard EDD thresholds; escalate to "
            "Financial Crime leadership for a final decision.",
        )

    return {
        "company": company_name,
        "risk_score": score,
        "confidence": confidence,
        "summary": summary,
        "flags": flags,
        "timeline": timeline,
        "entities": entities,
        "recommendation": recommendation,
        "recommendation_reasoning": reasoning,
    }


def _mock_articles_for(query: str, count: int = 5) -> List[Article]:
    rng = random.Random(_hash_seed(query) + 1)
    sources = ["Reuters", "Bloomberg", "Financial Times", "Wall Street Journal", "AP News", "The Guardian"]
    headlines = [
        f"{query} faces scrutiny over disclosed financial irregularities",
        f"Regulators examine {query} amid compliance concerns",
        f"What we know about the {query} investigation so far",
        f"{query} denies wrongdoing as probe continues",
        f"Analysis: what the {query} case means for the sector",
        f"{query} shares react to adverse media coverage",
    ]
    rng.shuffle(headlines)
    articles = []
    for i in range(min(count, len(headlines))):
        articles.append(Article(
            title=headlines[i],
            source=rng.choice(sources),
            published_date=f"202{rng.randint(3,6)}-{rng.randint(1,12):02d}-{rng.randint(1,28):02d}",
            summary=(
                f"Coverage discusses allegations and regulatory context surrounding {query}, "
                "citing sources familiar with the matter. (Mock summary - demo mode.)"
            ),
            link="https://news.google.com/search?q=" + query.replace(" ", "+"),
            content=None,
        ))
    return articles


def generate_mock_investigation(query: str, real_articles: Optional[List[Article]] = None) -> InvestigationReport:
    """Build a full InvestigationReport without calling any external AI API."""
    key = query.strip().lower()
    case = None
    for needle, data in _CURATED_CASES.items():
        if needle in key:
            case = data
            break

    if case is None:
        case = _build_generic_case(query)

    articles = real_articles if real_articles else _mock_articles_for(case.get("company", query))

    return InvestigationReport(
        company=case["company"],
        risk_score=case["risk_score"],
        risk_level=score_to_level(case["risk_score"]),
        confidence=case["confidence"],
        summary=case["summary"],
        timeline=[TimelineEvent(**t) for t in case["timeline"]],
        entities=Entities(**case["entities"]),
        flags=case["flags"],
        articles=articles[:8],
        recommendation=case["recommendation"],
        recommendation_reasoning=case["recommendation_reasoning"],
        is_mock=True,
    )
