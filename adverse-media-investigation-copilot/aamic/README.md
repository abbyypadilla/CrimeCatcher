# AI Adverse Media Investigation Copilot

An AI assistant for Financial Crime / AML analysts that automatically researches a company or
person, summarizes adverse media, identifies financial-crime risk indicators, builds a timeline,
extracts entities, and produces a structured investigation report — built to cut adverse-media
research time from 20+ minutes down to under 2.

Built for a banking hackathon MVP. Runs fully offline in **mock mode** (no API keys required) and
upgrades automatically to live AI analysis once an OpenAI key is added.

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React + Vite + TypeScript + Tailwind CSS + shadcn/ui-style components + Lucide icons |
| Backend  | FastAPI (Python) |
| AI       | OpenAI API, structured JSON output |
| News     | Google News RSS (+ optional NewsAPI.org), with deduplication |

## Project layout

```
aamic/
├── backend/
│   ├── main.py              # FastAPI app: GET /, GET /health, POST /investigate
│   ├── app/
│   │   ├── models.py        # Pydantic request/response schema
│   │   ├── news_service.py  # Google News RSS + NewsAPI retrieval, dedup
│   │   ├── ai_service.py    # OpenAI call + JSON parsing + graceful fallback
│   │   ├── mock_data.py     # Realistic offline demo data generator
│   │   └── risk_scoring.py  # Shared score -> Low/Medium/High mapping
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, SearchBar, LoadingScreen, report panels, ui/*
│   │   ├── lib/              # api.ts (fetch client), utils.ts, risk.ts
│   │   ├── types/            # investigation.ts - shared TS interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

---

## Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env        # optional - leave OPENAI_API_KEY blank to run in mock mode
uvicorn main:app --reload
```

The API is now running at `http://localhost:8000` (interactive docs at `/docs`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # defaults to http://localhost:8000, adjust if needed
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

### 3. Try it

Search for a company or person — e.g. `Wirecard`, `FTX`, or any name you like. The app will:

1. Pull current Google News RSS results for the query (and NewsAPI, if configured).
2. Deduplicate articles by title/link.
3. Send them to OpenAI for structured AML-style analysis (or generate realistic mock data if no
   key is configured).
4. Render the full investigation report: risk score, risk level, confidence, executive summary,
   timeline, risk indicator tags, extracted entities, source articles, and a recommendation.

---

## Mock mode (no API key required)

If `OPENAI_API_KEY` is not set — or the OpenAI call fails for any reason — the backend
automatically falls back to `app/mock_data.py`, which:

- Returns hand-curated, realistic data for a few well-known cases (e.g. Wirecard, FTX) so the demo
  has a convincing "real" example on hand.
- Generates plausible, deterministic-per-query data for any other search (consistent risk score,
  flags, timeline, and entities each time the same name is searched).
- Still uses real headlines from Google News RSS as the "News Sources" list whenever the network
  is reachable, even though the AI analysis itself is simulated.

The `is_mock` field in the API response tells the frontend whether it's looking at live AI output
or demo data, and a small badge appears on the Subject card when in mock mode.

## Live AI mode

Set `OPENAI_API_KEY` in `backend/.env` to switch on real analysis. The backend sends a single
structured prompt (see `app/ai_service.py`) asking the model to return one JSON object containing
the summary, risk score, confidence, timeline, entities, flags, and recommendation, using the
`response_format: json_object` mode for reliability. Any malformed response automatically falls
back to mock mode rather than breaking the demo.

## Risk scoring rubric

| Score range | Typical findings |
|-------------|-------------------|
| 90 - 100    | Confirmed fraud, executive arrest/conviction, sanctions, money laundering |
| 70 - 89     | Active regulatory investigation, accounting irregularities, tax fraud |
| 40 - 69     | Negative media coverage, civil lawsuits, minor violations |
| 0 - 39      | No significant adverse findings |

Risk level badges: 70+ = **High**, 40-69 = **Medium**, 0-39 = **Low**.

## API reference

### `POST /investigate`

Request:
```json
{ "query": "Wirecard" }
```

Response (truncated):
```json
{
  "company": "Wirecard AG",
  "risk_score": 96,
  "risk_level": "High",
  "confidence": 94,
  "summary": "...",
  "timeline": [{ "year": "2020", "title": "...", "description": "...", "severity": "high" }],
  "entities": { "people": [...], "companies": [...], "countries": [...], "banks": [...], "government_agencies": [...] },
  "flags": ["Accounting Fraud", "Executive Arrest"],
  "articles": [{ "title": "...", "source": "...", "published_date": "...", "summary": "...", "link": "..." }],
  "recommendation": "Reject",
  "recommendation_reasoning": "...",
  "is_mock": false
}
```

### `GET /health` → `{ "status": "ok" }`

---

## Design notes

The UI follows a "Bloomberg Terminal meets Microsoft Copilot" direction: a dense, data-forward
navy header with a live scrolling AML-taxonomy ticker (the signature element — a nod to a market
ticker, repurposed to show which compliance categories are being scanned), paired with calm white
card surfaces for the report itself so the findings stay easy to scan. Type system: **Space
Grotesk** for display headings, **Inter** for body copy, **IBM Plex Mono** for data, tags, and the
ticker — reinforcing the "terminal" feel without sacrificing readability.

## Nice-to-have features included

- Dark mode toggle (header, top right)
- Animated card entrance + progress bar during investigation
- Expandable article rows in News Sources
- "Download PDF" via print-optimized styling
- "Copy" button on the executive summary
- Deterministic mock mode so demos are repeatable

## Notes & limitations

- This is a hackathon MVP: AI-generated findings should always be verified by a qualified
  investigator before any real onboarding/exit decision — the UI footer reflects this.
- Google News RSS has no official SLA; if it's unreachable, the app still works end-to-end via
  mock article data.
- No authentication is implemented, per the brief.
