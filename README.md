# MediClear-Project-
# MediClear

MediClear is an AI tool that reads a user's lab report (PDF or a photo of a paper
report) and explains every abnormal test value in plain, everyday language, with a
clear urgency flag (Normal / Monitor / Consult Doctor Soon) — instead of a raw
"High/Low" marker that gives no context on how serious it is or what to do next.

Unlike a plain lab printout, MediClear uses an agentic reasoning chain: it extracts
test values, decides on its own which ones are ambiguous and need closer inspection,
reasons more deeply about just those, and only then finalizes the urgency status and
any specialist suggestion.

## Project Structure

```
mediclear/
├── mediclear-backend/     # Node.js + Express API
├── mediclear-frontend/    # React (Vite) web app
├── ARCHITECTURE.md        # System architecture and data flow
├── SCHEMA.md               # Database schema
└── WIREFRAMES.md           # Screen wireframes
```

## Tech Stack

- Frontend: React (Vite) + Tailwind/CSS
- Backend: Node.js + Express
- Auth + Database: Supabase (Postgres, free tier)
- PDF text extraction: pdf-parse
- Scanned image OCR: tesseract.js
- AI: Claude (via OpenRouter), model configurable in `.env`

## Setup

See `mediclear-backend/README.md` and `mediclear-frontend/README.md` for
per-project setup instructions.
