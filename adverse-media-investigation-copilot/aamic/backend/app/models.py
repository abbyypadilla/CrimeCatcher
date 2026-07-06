"""
Pydantic models for the AI Adverse Media Investigation Copilot.

These models define the request/response contract between the FastAPI
backend and the React frontend, and are also the schema the AI service
is asked to fill in (via structured JSON output).
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class InvestigateRequest(BaseModel):
    """Incoming request body for POST /investigate."""

    query: str = Field(..., min_length=2, description="Company or person to investigate")


class TimelineEvent(BaseModel):
    """A single dated event in the adverse media timeline."""

    year: str = Field(..., description="Year or date label, e.g. '2023' or 'Mar 2023'")
    title: str = Field(..., description="Short headline for the event")
    description: str = Field(..., description="One to two sentence description of the event")
    severity: str = Field(default="medium", description="low | medium | high")


class Entities(BaseModel):
    """Named entities extracted from the adverse media corpus."""

    people: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)
    countries: List[str] = Field(default_factory=list)
    banks: List[str] = Field(default_factory=list)
    government_agencies: List[str] = Field(default_factory=list)


class Article(BaseModel):
    """A single news source used as evidence in the investigation."""

    title: str
    source: str
    published_date: str
    summary: str
    link: str
    content: Optional[str] = None


class InvestigationReport(BaseModel):
    """Full response body returned by POST /investigate."""

    company: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="Low | Medium | High")
    confidence: int = Field(..., ge=0, le=100)
    summary: str
    timeline: List[TimelineEvent] = Field(default_factory=list)
    entities: Entities = Field(default_factory=Entities)
    flags: List[str] = Field(default_factory=list)
    articles: List[Article] = Field(default_factory=list)
    recommendation: str = Field(..., description="Approve | Review | Enhanced Due Diligence | Escalate | Reject")
    recommendation_reasoning: str = ""
    is_mock: bool = Field(default=False, description="True if generated without a live OpenAI key")
