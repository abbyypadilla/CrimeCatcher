"""
AI Adverse Media Investigation Copilot - FastAPI backend.

Endpoints:
    GET  /            basic service info
    GET  /health      health check
    POST /investigate run a full adverse-media investigation for a query

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload
"""

from __future__ import annotations

import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import ai_service, news_service
from app.models import InvestigateRequest, InvestigationReport

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="AI Adverse Media Investigation Copilot",
    description="AML/Financial Crime adverse media research assistant.",
    version="1.0.0",
)

# Hackathon demo: wide-open CORS so the Vite dev server (any localhost port)
# can call the API without extra configuration.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "AI Adverse Media Investigation Copilot",
        "status": "running",
        "docs": "/docs",
        "endpoints": ["GET /health", "POST /investigate"],
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/investigate", response_model=InvestigationReport)
def investigate(payload: InvestigateRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="query must not be empty")

    started = time.time()
    logger.info("Investigating: %s", query)

    articles = news_service.fetch_news(query)
    logger.info("Retrieved %d deduplicated articles for '%s'", len(articles), query)

    report = ai_service.analyze(query, articles)

    elapsed = round(time.time() - started, 2)
    logger.info("Investigation for '%s' completed in %ss (mock=%s)", query, elapsed, report.is_mock)

    return report
