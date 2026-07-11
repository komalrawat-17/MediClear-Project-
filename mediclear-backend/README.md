# MediClear Backend

## Setup

```bash
cd mediclear-backend
npm install
cp .env.example .env
```

Then open `.env` and fill in:
- `OPENROUTER_API_KEY` — from openrouter.ai → Keys
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings → API (create a free project at supabase.com if you haven't yet)

## Run

```bash
npm run dev
```

Then open `http://localhost:5000` in your browser — you should see:
```json
{"status":"ok","message":"MediClear backend is running"}
```

This confirms Milestone 1's backend setup is working. The real report-analysis
route is added in Milestone 2.
