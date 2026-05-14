# Instagram → n8n → Supabase → Website Pipeline

**Date:** 2026-05-15  
**Status:** Approved

## Problem

Barcelona running clubs announce events on Instagram, not on Strava or any structured API. The website currently shows a hardcoded recurring schedule. This pipeline automates discovery of real announced events from club Instagram pages.

## Architecture

```
Instagram public profiles
        ↓  HTTP scrape (daily 07:00 Madrid)
    n8n on Railway
        ↓  caption text
  Groq API (Llama 3, free)
        ↓  structured JSON
  Supabase (postgres, free)
        ↓  read at request time
  /api/events (Next.js)
        ↓
  EventCard components
```

## Components

### 1. n8n Workflow (Railway-hosted)

**Trigger:** Schedule — daily 07:00 Europe/Madrid  
**Exported as:** `n8n-instagram-workflow.json` committed to repo

Steps per Instagram handle:
1. HTTP Request → `https://www.instagram.com/{handle}/` with browser User-Agent
2. Code node → extract embedded `window._sharedData` or `<script type="application/json">` JSON, pull last 3 post captions + post URLs
3. HTTP Request → Groq API (`llama-3.1-8b-instant`) with extraction prompt
4. IF node → skip if `found: false`
5. Supabase node → upsert row keyed by post URL

**Groq extraction prompt:**
```
From this Instagram caption, extract any running event details.
Return ONLY valid JSON: {"found":true,"title":"...","date":"YYYY-MM-DD","time":"HH:MM","meetingPoint":"...","distance":"...","description":"..."}
If no clear event, return {"found":false}.
Caption: {caption}
```

**Handles monitored:**
- `midnightrunnersbarcelona`
- `runners.barcelona` (Adidas Runners)
- `b3tterrunclub`
- `ordinaryrunclub`
- `razzeclub`
- `galacticrunclub`
- `sunriserunnersbarcelona`
- `clubrodeobcn`

### 2. Supabase Table: `instagram_events`

```sql
CREATE TABLE instagram_events (
  id           TEXT PRIMARY KEY,          -- post URL (deduplication key)
  title        TEXT NOT NULL,
  club         TEXT NOT NULL,             -- Instagram handle
  meeting_point TEXT,
  starts_at    TIMESTAMPTZ NOT NULL,
  distance     TEXT,
  description  TEXT,
  post_url     TEXT NOT NULL,
  raw_caption  TEXT,
  accent       TEXT NOT NULL DEFAULT 'coral',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date-range queries
CREATE INDEX instagram_events_starts_at ON instagram_events (starts_at);

-- Row Level Security: public read, no public write
ALTER TABLE instagram_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON instagram_events FOR SELECT USING (true);
```

**Accent assignment per club** (deterministic, matches existing palette):
- `midnightrunnersbarcelona` → `lavender`
- `runners.barcelona` → `mint`
- `b3tterrunclub` → `butter`
- `ordinaryrunclub` → `peach`
- `razzeclub` → `coral`
- others → rotate through ACCENTS array

### 3. `lib/instagram.ts` (new file)

- Exports `getInstagramEvents(): Promise<RunningEvent[]>`
- Queries Supabase for rows where `starts_at` is between now and now+7 days
- Maps to `RunningEvent` shape used by the rest of the app
- Adds `type: 'social'` and `signupUrl` pointing to the post URL

### 4. `app/api/events/route.ts` (updated)

Adds Instagram events to the existing merge:
```
Strava confirmed (future) + Instagram events + weekly schedule
```
Sorted by `startsAt`, deduplicated by club+day.

Source label becomes:
`"Recurring schedule · 8 clubs · {n} from Instagram · {m} confirmed on Strava"`

### 5. New env vars

| Variable | Where used |
|---|---|
| `SUPABASE_URL` | `lib/instagram.ts` |
| `SUPABASE_ANON_KEY` | `lib/instagram.ts` |
| `GROQ_API_KEY` | n8n workflow env var on Railway |

## Error handling

- If Instagram scrape fails for a handle → log + skip, continue other handles
- If Groq returns malformed JSON → skip that post
- If Supabase upsert fails → n8n retries once, then logs error
- If `getInstagramEvents()` throws → `route.ts` catches silently, site shows Strava + schedule only

## Setup sequence

1. Create Supabase project → run SQL schema → copy URL + anon key
2. Deploy n8n on Railway using official Docker image
3. Import `n8n-instagram-workflow.json`
4. Set env vars in Railway: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GROQ_API_KEY`
5. Add `SUPABASE_URL` + `SUPABASE_ANON_KEY` to `.env.local` and Vercel
6. Manual test run in n8n → verify rows appear in Supabase → verify `/api/events` returns them
