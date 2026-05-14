# Instagram → n8n → Supabase Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically scrape Instagram posts from Barcelona running clubs daily, extract event details with AI, store in Supabase, and surface them as real EventCards on running-news.vercel.app.

**Architecture:** n8n (Railway) fetches each club's public Instagram page daily at 07:00, sends captions to Groq (free Llama 3) for structured extraction, upserts results into a Supabase `instagram_events` table. The Next.js `/api/events` route reads from that table and merges results with Strava + recurring schedule.

**Tech Stack:** Next.js 14, TypeScript, `@supabase/supabase-js`, n8n (Railway Docker), Groq API (free), Supabase (free PostgreSQL)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/instagram.ts` | **Create** | Supabase client + `getInstagramEvents()` |
| `app/api/events/route.ts` | **Modify** | Merge Instagram events into response |
| `n8n-workflow/instagram-pipeline.json` | **Create** | Importable n8n workflow |
| `.env.local` | **Modify** | Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `package.json` | **Modify** | Add `@supabase/supabase-js` |

---

## Task 1: Create Supabase project and schema

**Files:** None (external service setup)

- [ ] **Step 1: Create Supabase project**

  Go to `https://supabase.com` → New project → name it `running-news` → choose Frankfurt region (closest to Barcelona) → create. Wait ~1 minute for provisioning.

- [ ] **Step 2: Run the schema SQL**

  In Supabase dashboard → SQL Editor → New query → paste and run:

  ```sql
  CREATE TABLE instagram_events (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    club          TEXT NOT NULL,
    meeting_point TEXT,
    starts_at     TIMESTAMPTZ NOT NULL,
    distance      TEXT,
    description   TEXT,
    post_url      TEXT NOT NULL,
    raw_caption   TEXT,
    accent        TEXT NOT NULL DEFAULT 'coral',
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX instagram_events_starts_at ON instagram_events (starts_at);

  ALTER TABLE instagram_events ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Public read"
    ON instagram_events FOR SELECT USING (true);
  ```

- [ ] **Step 3: Copy credentials**

  In Supabase → Settings → API. Copy:
  - **Project URL** → `SUPABASE_URL`
  - **anon public key** → `SUPABASE_ANON_KEY`
  - **service_role secret key** → `SUPABASE_SERVICE_KEY` (for n8n — has write access)

---

## Task 2: Install Supabase client

**Files:** `package.json`

- [ ] **Step 1: Install**

  ```bash
  cd ~/Desktop/running-news && npm install @supabase/supabase-js
  ```

  Expected: `added 4 packages`

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no output (no errors)

---

## Task 3: Create `lib/instagram.ts`

**Files:** Create `lib/instagram.ts`

- [ ] **Step 1: Create the file**

  ```typescript
  // lib/instagram.ts
  import { createClient } from '@supabase/supabase-js'
  import type { RunningEvent, EventAccent } from './types'

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  )

  interface InstagramEventRow {
    id: string
    title: string
    club: string
    meeting_point: string | null
    starts_at: string
    distance: string | null
    description: string | null
    post_url: string
    accent: string
  }

  export async function getInstagramEvents(): Promise<RunningEvent[]> {
    const now = new Date().toISOString()
    const windowEnd = new Date(Date.now() + 6 * 86_400_000).toISOString()

    const { data, error } = await supabase
      .from('instagram_events')
      .select('id, title, club, meeting_point, starts_at, distance, description, post_url, accent')
      .gte('starts_at', now)
      .lte('starts_at', windowEnd)
      .order('starts_at', { ascending: true })

    if (error) throw new Error(`Supabase query failed: ${error.message}`)

    return (data as InstagramEventRow[]).map((row) => ({
      id: `ig-${row.id.slice(-12)}`,
      title: row.title,
      club: row.club,
      city: 'Barcelona',
      meetingPoint: row.meeting_point ?? 'See Instagram post',
      startsAt: row.starts_at,
      durationMin: 60,
      distance: row.distance ?? undefined,
      type: 'social' as const,
      signupUrl: row.post_url,
      accent: (row.accent as EventAccent) ?? 'coral',
    }))
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no output

---

## Task 4: Update `app/api/events/route.ts`

**Files:** Modify `app/api/events/route.ts`

- [ ] **Step 1: Replace the file with this content**

  ```typescript
  import { NextResponse } from 'next/server'
  import { getStravaAgenda } from '@/lib/strava'
  import { getWeeklySchedule } from '@/lib/weeklySchedule'
  import { getInstagramEvents } from '@/lib/instagram'
  import type { RunningEvent, WeeklyAgenda } from '@/lib/types'

  export const revalidate = 600

  function addDays(d: Date, n: number): Date {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
  }

  export async function GET() {
    const scheduleEvents = getWeeklySchedule()

    // Strava confirmed upcoming events
    let stravaEvents: RunningEvent[] = []
    let stravaSource = ''
    try {
      const agenda = await getStravaAgenda()
      stravaEvents = agenda.events.filter(
        (e) => new Date(e.startsAt).getTime() > Date.now(),
      )
      stravaSource = stravaEvents.length > 0
        ? ` · ${stravaEvents.length} confirmed on Strava`
        : ''
    } catch { /* Strava down — continue */ }

    // Instagram scraped events
    let instagramEvents: RunningEvent[] = []
    let igSource = ''
    try {
      instagramEvents = await getInstagramEvents()
      igSource = instagramEvents.length > 0
        ? ` · ${instagramEvents.length} from Instagram`
        : ''
    } catch { /* Supabase down — continue */ }

    // Deduplicate: build a set of club+day keys from confirmed sources
    const confirmedKeys = new Set(
      [...stravaEvents, ...instagramEvents].map((e) => {
        const d = new Date(e.startsAt)
        return `${e.club}-${d.toDateString()}`
      }),
    )

    const filteredSchedule = scheduleEvents.filter((e) => {
      const d = new Date(e.startsAt)
      return !confirmedKeys.has(`${e.club}-${d.toDateString()}`)
    })

    const merged: RunningEvent[] = [
      ...stravaEvents,
      ...instagramEvents,
      ...filteredSchedule,
    ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

    const today = new Date()
    const windowEnd = addDays(today, 6)

    const payload: WeeklyAgenda = {
      weekStart: today.toISOString(),
      weekEnd: windowEnd.toISOString(),
      city: 'Barcelona',
      events: merged,
      lastUpdated: new Date().toISOString(),
      source: `Recurring schedule · 8 clubs${igSource}${stravaSource}`,
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' },
    })
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no output

- [ ] **Step 3: Build to confirm no runtime errors**

  ```bash
  npm run build
  ```

  Expected: `✓ Compiled successfully`

---

## Task 5: Add env vars locally and to Vercel

**Files:** `.env.local`

- [ ] **Step 1: Add to `.env.local`**

  Append these two lines (replace with your actual values from Task 1 Step 3):

  ```
  SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- [ ] **Step 2: Add to Vercel**

  ```bash
  echo "YOUR_SUPABASE_URL" | vercel env add SUPABASE_URL production --yes
  echo "YOUR_SUPABASE_ANON_KEY" | vercel env add SUPABASE_ANON_KEY production --yes
  ```

  Expected: `Added Environment Variable SUPABASE_URL to Project running-news`

- [ ] **Step 3: Test the endpoint locally**

  ```bash
  curl -s http://localhost:3000/api/events | python3 -c "import json,sys; d=json.load(sys.stdin); print('SOURCE:', d['source'])"
  ```

  Expected: `SOURCE: Recurring schedule · 8 clubs` (no Instagram yet — table is empty, that's correct)

- [ ] **Step 4: Commit**

  ```bash
  git add lib/instagram.ts app/api/events/route.ts package.json package-lock.json
  git commit -m "feat: add Supabase instagram_events source to /api/events"
  git push origin main
  ```

---

## Task 6: Create the n8n workflow JSON

**Files:** Create `n8n-workflow/instagram-pipeline.json`

- [ ] **Step 1: Create directory**

  ```bash
  mkdir -p ~/Desktop/running-news/n8n-workflow
  ```

- [ ] **Step 2: Create the workflow file**

  Create `n8n-workflow/instagram-pipeline.json` with this content:

  ```json
  {
    "name": "Instagram Running Events Pipeline",
    "nodes": [
      {
        "parameters": {
          "rule": { "interval": [{ "field": "cronExpression", "expression": "0 7 * * *" }] },
          "timezone": "Europe/Madrid"
        },
        "id": "node-schedule",
        "name": "Daily 07:00 Madrid",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.1,
        "position": [0, 300]
      },
      {
        "parameters": {
          "assignments": {
            "assignments": [
              {
                "id": "handles",
                "name": "handles",
                "value": "={{ ['midnightrunnersbarcelona','runners.barcelona','b3tterrunclub','ordinaryrunclub','razzeclub','galacticrunclub','sunriserunnersbarcelona','clubrodeobcn'] }}",
                "type": "array"
              }
            ]
          },
          "options": {}
        },
        "id": "node-clubs",
        "name": "Club Handles",
        "type": "n8n-nodes-base.set",
        "typeVersion": 3.3,
        "position": [220, 300]
      },
      {
        "parameters": {
          "fieldToSplitOut": "handles",
          "options": {}
        },
        "id": "node-split",
        "name": "Split by Handle",
        "type": "n8n-nodes-base.splitOut",
        "typeVersion": 1,
        "position": [440, 300]
      },
      {
        "parameters": {
          "method": "GET",
          "url": "=https://api.allorigins.win/get?url={{ encodeURIComponent('https://www.instagram.com/' + $json.handles + '/?__a=1&__d=dis') }}",
          "options": {
            "timeout": 15000,
            "response": { "response": { "fullResponse": false } }
          }
        },
        "id": "node-fetch",
        "name": "Fetch Instagram Page",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [660, 300],
        "continueOnFail": true
      },
      {
        "parameters": {
          "language": "javaScript",
          "jsCode": "// Extract last 3 captions from Instagram page HTML/JSON\nconst handle = $('Split by Handle').item.json.handles;\nconst raw = $input.item.json.contents || '';\n\nlet captions = [];\ntry {\n  // Try parsing as JSON first (Instagram API response)\n  const parsed = JSON.parse(raw);\n  const edges = parsed?.graphql?.user?.edge_owner_to_timeline_media?.edges\n    || parsed?.data?.user?.edge_owner_to_timeline_media?.edges\n    || [];\n  captions = edges.slice(0, 3).map(e => ({\n    caption: e?.node?.edge_media_to_caption?.edges?.[0]?.node?.text || '',\n    postUrl: 'https://www.instagram.com/p/' + (e?.node?.shortcode || '') + '/'\n  }));\n} catch {\n  // Fallback: extract from HTML meta tags\n  const metaMatches = raw.matchAll(/<meta property=\"og:description\" content=\"([^\"]+)\"/g);\n  for (const m of metaMatches) {\n    captions.push({ caption: m[1], postUrl: 'https://www.instagram.com/' + handle + '/' });\n    if (captions.length >= 2) break;\n  }\n}\n\nif (captions.length === 0) return [];\n\nreturn captions.map(c => ({ json: { handle, caption: c.caption, postUrl: c.postUrl } }));\n"
        },
        "id": "node-parse",
        "name": "Parse Captions",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [880, 300]
      },
      {
        "parameters": {
          "method": "POST",
          "url": "https://api.groq.com/openai/v1/chat/completions",
          "authentication": "genericCredentialType",
          "genericAuthType": "httpHeaderAuth",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              { "name": "Authorization", "value": "=Bearer {{ $env.GROQ_API_KEY }}" },
              { "name": "Content-Type", "value": "application/json" }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"model\": \"llama-3.1-8b-instant\",\n  \"temperature\": 0,\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"You extract running event details from Instagram captions. Always respond with valid JSON only, no markdown.\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"From this Instagram caption, extract any running event. Return ONLY this JSON:\\n{\\\"found\\\":true,\\\"title\\\":\\\"...\\\",\\\"date\\\":\\\"YYYY-MM-DD\\\",\\\"time\\\":\\\"HH:MM\\\",\\\"meetingPoint\\\":\\\"...\\\",\\\"distance\\\":\\\"...\\\",\\\"club\\\":\\\"...\\\"}\\nIf no event found, return {\\\"found\\\":false}.\\n\\nCaption: {{ $json.caption }}\\nInstagram handle: {{ $json.handle }}\\nPost URL: {{ $json.postUrl }}\"\n    }\n  ]\n}",
          "options": { "timeout": 20000 }
        },
        "id": "node-groq",
        "name": "Groq Extract Event",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [1100, 300],
        "continueOnFail": true
      },
      {
        "parameters": {
          "language": "javaScript",
          "jsCode": "const groqResponse = $input.item.json;\nconst postUrl = $('Parse Captions').item.json.postUrl;\nconst handle = $('Parse Captions').item.json.handle;\n\nlet extracted;\ntry {\n  const content = groqResponse?.choices?.[0]?.message?.content || '{\"found\":false}';\n  extracted = JSON.parse(content);\n} catch {\n  return [{ json: { found: false } }];\n}\n\nif (!extracted.found) return [{ json: { found: false } }];\n\n// Resolve date: if AI returns a relative description, use next occurrence of that weekday\nlet startsAt;\ntry {\n  const d = new Date(`${extracted.date}T${extracted.time || '10:00'}:00+02:00`);\n  if (isNaN(d.getTime())) throw new Error('invalid date');\n  startsAt = d.toISOString();\n} catch {\n  return [{ json: { found: false } }];\n}\n\n// Only keep events in the next 30 days\nconst inThirtyDays = Date.now() + 30 * 86400000;\nif (new Date(startsAt).getTime() < Date.now() || new Date(startsAt).getTime() > inThirtyDays) {\n  return [{ json: { found: false } }];\n}\n\n// Assign accent per club\nconst ACCENTS = { midnightrunnersbarcelona:'lavender', 'runners.barcelona':'mint', b3tterrunclub:'butter', ordinaryrunclub:'peach', razzeclub:'coral', galacticrunclub:'lavender', sunriserunnersbarcelona:'butter', clubrodeobcn:'mint' };\n\nreturn [{ json: {\n  found: true,\n  id: postUrl,\n  title: extracted.title || `Run · ${handle}`,\n  club: extracted.club || handle,\n  meeting_point: extracted.meetingPoint || null,\n  starts_at: startsAt,\n  distance: extracted.distance || null,\n  post_url: postUrl,\n  accent: ACCENTS[handle] || 'coral',\n} }];\n"
        },
        "id": "node-format",
        "name": "Format Event Row",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1320, 300]
      },
      {
        "parameters": {
          "conditions": {
            "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict" },
            "conditions": [
              {
                "id": "found-check",
                "leftValue": "={{ $json.found }}",
                "rightValue": true,
                "operator": { "type": "boolean", "operation": "true" }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        },
        "id": "node-if",
        "name": "Event Found?",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2,
        "position": [1540, 300]
      },
      {
        "parameters": {
          "method": "POST",
          "url": "={{ $env.SUPABASE_URL }}/rest/v1/instagram_events",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              { "name": "apikey", "value": "={{ $env.SUPABASE_SERVICE_KEY }}" },
              { "name": "Authorization", "value": "=Bearer {{ $env.SUPABASE_SERVICE_KEY }}" },
              { "name": "Content-Type", "value": "application/json" },
              { "name": "Prefer", "value": "resolution=merge-duplicates,return=minimal" }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={{ { id: $json.id, title: $json.title, club: $json.club, meeting_point: $json.meeting_point, starts_at: $json.starts_at, distance: $json.distance, post_url: $json.post_url, accent: $json.accent } }}",
          "options": { "timeout": 10000 }
        },
        "id": "node-supabase",
        "name": "Upsert to Supabase",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [1760, 200],
        "continueOnFail": true
      }
    ],
    "connections": {
      "Daily 07:00 Madrid": { "main": [[{ "node": "Club Handles", "type": "main", "index": 0 }]] },
      "Club Handles": { "main": [[{ "node": "Split by Handle", "type": "main", "index": 0 }]] },
      "Split by Handle": { "main": [[{ "node": "Fetch Instagram Page", "type": "main", "index": 0 }]] },
      "Fetch Instagram Page": { "main": [[{ "node": "Parse Captions", "type": "main", "index": 0 }]] },
      "Parse Captions": { "main": [[{ "node": "Groq Extract Event", "type": "main", "index": 0 }]] },
      "Groq Extract Event": { "main": [[{ "node": "Format Event Row", "type": "main", "index": 0 }]] },
      "Format Event Row": { "main": [[{ "node": "Event Found?", "type": "main", "index": 0 }]] },
      "Event Found?": {
        "main": [
          [{ "node": "Upsert to Supabase", "type": "main", "index": 0 }],
          []
        ]
      }
    },
    "settings": { "executionOrder": "v1", "timezone": "Europe/Madrid" },
    "staticData": null,
    "meta": { "templateCredsSetupCompleted": true }
  }
  ```

- [ ] **Step 3: Commit the workflow**

  ```bash
  git add n8n-workflow/
  git commit -m "feat: add n8n Instagram pipeline workflow JSON"
  git push origin main
  ```

---

## Task 7: Deploy n8n on Railway

**Files:** None (external service)

- [ ] **Step 1: Create Railway account and project**

  Go to `https://railway.app` → New Project → Deploy from Docker image

- [ ] **Step 2: Configure the Docker service**

  Docker image: `n8nio/n8n:latest`

  In Railway service settings → Variables, add:

  ```
  N8N_BASIC_AUTH_ACTIVE=true
  N8N_BASIC_AUTH_USER=admin
  N8N_BASIC_AUTH_PASSWORD=choose-a-strong-password
  N8N_HOST=0.0.0.0
  N8N_PORT=5678
  N8N_PROTOCOL=https
  WEBHOOK_URL=https://your-railway-domain.up.railway.app
  GROQ_API_KEY=your-groq-key-from-console.groq.com
  SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
  SUPABASE_SERVICE_KEY=your-supabase-service-role-key
  ```

- [ ] **Step 3: Add a persistent volume**

  Railway → your n8n service → Volumes → Add volume → mount path `/home/node/.n8n`

  This persists workflows and credentials across restarts.

- [ ] **Step 4: Note your Railway domain**

  Railway assigns a domain like `your-app.up.railway.app`. Note it — you'll use it to access n8n.

---

## Task 8: Import workflow and do a test run

**Files:** None

- [ ] **Step 1: Open n8n**

  Go to `https://your-app.up.railway.app` → log in with the credentials you set.

- [ ] **Step 2: Import the workflow**

  In n8n → top-right menu → Import from file → select `n8n-workflow/instagram-pipeline.json` → Import.

- [ ] **Step 3: Manual test run**

  Click the workflow → click **Execute Workflow** (top right). Watch each node execute. Green = success, red = error.

  Expected: Most handles will fetch, Groq will extract 0–2 events per handle depending on whether clubs posted events recently.

- [ ] **Step 4: Verify rows in Supabase**

  In Supabase → Table Editor → `instagram_events`. You should see rows if any events were found.

  If the table is empty after a successful run, it means clubs haven't posted upcoming events recently — this is normal. The workflow will populate it the next time clubs post.

- [ ] **Step 5: Activate the schedule**

  Toggle the workflow from **Inactive** to **Active**. It will now run every day at 07:00 Madrid time automatically.

- [ ] **Step 6: Insert a test row to verify the website picks it up**

  In Supabase → SQL Editor:

  ```sql
  INSERT INTO instagram_events (id, title, club, meeting_point, starts_at, distance, post_url, accent)
  VALUES (
    'https://www.instagram.com/p/test123/',
    'Test Run · Barceloneta',
    'razzeclub',
    'Barceloneta seafront',
    NOW() + INTERVAL '2 days',
    '5K',
    'https://www.instagram.com/p/test123/',
    'coral'
  );
  ```

- [ ] **Step 7: Verify the website shows the test event**

  ```bash
  curl -s http://localhost:3000/api/events | python3 -c "
  import json, sys
  d = json.load(sys.stdin)
  print('SOURCE:', d['source'])
  ig = [e for e in d['events'] if e['id'].startswith('ig-')]
  print('Instagram events:', len(ig))
  for e in ig: print(' -', e['title'], '|', e['club'])
  "
  ```

  Expected:
  ```
  SOURCE: Recurring schedule · 8 clubs · 1 from Instagram
  Instagram events: 1
   - Test Run · Barceloneta | razzeclub
  ```

- [ ] **Step 8: Clean up test row and deploy**

  ```sql
  DELETE FROM instagram_events WHERE id = 'https://www.instagram.com/p/test123/';
  ```

  ```bash
  vercel --prod --yes
  ```

---

## Notes

**Instagram scraping fragility:** The `allorigins.win` proxy + Instagram page approach may stop working if Instagram changes their HTML structure. If the workflow produces empty results consistently, the fallback is to replace the "Fetch Instagram Page" node with the Apify Instagram Scraper API (`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs`) which has a free $5/month tier and is more reliable.

**Groq free limits:** 14,400 requests/day, 30 requests/minute. With 8 clubs × 3 posts = 24 Groq calls/day. Well within free tier.

**Supabase free limits:** 500MB storage, unlimited reads. At ~1KB per event, the table can hold 500,000 events before hitting limits.
