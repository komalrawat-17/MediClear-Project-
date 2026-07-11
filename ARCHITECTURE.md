# MediClear — Architecture

## High-Level Flow

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────────────┐
│              │      │                   │      │  Extraction Layer      │
│   Frontend   │─────▶│      Backend      │─────▶│  - pdf-parse (PDF)     │
│  (React/Vite)│      │  (Node/Express)   │      │  - tesseract.js (OCR)  │
│              │◀─────│                   │◀─────│                        │
└──────────────┘      └─────────┬─────────┘      └────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Agentic Reasoning Chain │
                    │  1. Extract test values  │
                    │  2. Self-assess ambiguous│
                    │  3. Deeper reasoning pass│
                    │     (ambiguous values)   │
                    │  4. Finalize status +    │
                    │     specialist suggestion│
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Supabase (Postgres)    │
                    │  users / reports /        │
                    │  test_values / agent_logs │
                    └─────────────────────────┘
```

## Component Responsibilities

- **Frontend**: Login/signup, file upload, results display, report history, trend
  view. Talks to the backend only via REST API calls with the user's session token.
- **Backend**: Receives the uploaded file, routes it to the correct extraction
  method based on file type, runs the agentic reasoning chain, stores results and
  logs in Supabase, returns structured JSON to the frontend.
- **Extraction layer**: `pdf-parse` for typed PDFs, `tesseract.js` for JPG/PNG
  scanned photos. Both output raw text, which is passed identically into the
  reasoning chain regardless of source.
- **Agentic reasoning chain**: The core intelligence layer. Not a single AI call —
  a sequence of AI calls where each step's output determines whether the next step
  runs, and on what data. Every step's output is logged to `agent_logs` for
  transparency and demo purposes.
- **Database**: Stores user accounts, uploaded report metadata, extracted test
  values, and the full agent reasoning trail per report.

## Why This Counts as Agentic (not just a wrapper)

A single prompt that reads text and returns JSON is a classifier, not an agent.
MediClear's chain has the AI making its own decision about what to do next (whether
a value needs deeper reasoning) based on its own prior output — that conditional,
self-directed branching is what makes it agentic.
