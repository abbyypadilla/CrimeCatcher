"""
Shared risk-scoring helpers.

Keeps the score -> level mapping in one place so the AI service and the
mock-data generator can't drift apart.
"""


def score_to_level(score: int) -> str:
    """Map a 0-100 risk score to a Low / Medium / High label."""
    if score >= 70:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"


def clamp_score(score: int) -> int:
    """Keep a score within the valid 0-100 range."""
    return max(0, min(100, score))


# Reference bands, surfaced in the README / used for prompt grounding.
RISK_BANDS = {
    "90-100": "Confirmed fraud, executive arrest, sanctions, money laundering conviction",
    "70-89": "Active regulatory investigation, accounting irregularities, tax fraud allegations",
    "40-69": "Negative media coverage, civil lawsuits, minor regulatory violations",
    "0-39": "No significant adverse findings",
}
