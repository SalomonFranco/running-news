import type { RunningEvent, WeeklyAgenda, EventAccent } from './types'

// ─── Token cache ─────────────────────────────────────────────────────────────

let cached: { token: string; exp: number } | null = null

async function getToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`)
  const data = await res.json()
  cached = { token: data.access_token, exp: data.expires_at * 1000 }
  return cached.token
}

// ─── Strava shapes ───────────────────────────────────────────────────────────

interface StravaClub {
  id: number
  name: string
  city: string
  country: string
  member_count: number
  sport_type: string
  url: string
}

interface StravaActivity {
  name: string
  distance: number      // metres — always present
  moving_time: number   // seconds — always present
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  athlete: { firstname: string; lastname: string }
}

type ActivityWithClub = StravaActivity & { _club: StravaClub; _seq: number }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCENTS: EventAccent[] = ['coral', 'mint', 'lavender', 'butter', 'peach']

function mToPace(distM: number, timeS: number): string {
  if (!distM || distM < 100) return 'Easy'
  const minsPerKm = timeS / 60 / (distM / 1000)
  const m = Math.floor(minsPerKm)
  const s = Math.round((minsPerKm - m) * 60)
  return `${m}:${s < 10 ? '0' + s : s}/km`
}

function mToLabel(m: number): string {
  const km = m / 1000
  if (km < 1) return `${Math.round(m)}m`
  return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)}K`
}

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - day + (day === 0 ? -6 : 1))
  r.setHours(0, 0, 0, 0)
  return r
}

// Strava strips dates from club activity feeds (privacy). We assign timestamps
// going backwards from now so the most-recently-fetched activity appears first.
// Each step is ~45 minutes — plausible for real run frequency.
function recentTimestamp(seqIndex: number): string {
  const now = Date.now()
  const offsetMs = seqIndex * 45 * 60 * 1000
  return new Date(now - offsetMs).toISOString()
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function getStravaAgenda(): Promise<WeeklyAgenda> {
  const token = await getToken()

  // 1. All clubs the athlete follows
  const clubsRes = await fetch(
    'https://www.strava.com/api/v3/athlete/clubs?per_page=30',
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
  )
  if (!clubsRes.ok) throw new Error(`Clubs fetch failed: ${clubsRes.status}`)
  const allClubs: StravaClub[] = await clubsRes.json()

  const runningClubs = allClubs.filter((c) =>
    c.sport_type?.toLowerCase().includes('running') ||
    c.sport_type?.toLowerCase() === 'other', // some clubs have generic type
  )

  if (runningClubs.length === 0) throw new Error('No clubs found')

  // 2. Recent activities from every club (parallel)
  const perClub = await Promise.all(
    runningClubs.map(async (club): Promise<ActivityWithClub[]> => {
      const r = await fetch(
        `https://www.strava.com/api/v3/clubs/${club.id}/activities?per_page=5`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
      )
      if (!r.ok) return []
      const acts: StravaActivity[] = await r.json()
      return acts
        .filter((a) => a.type === 'Run' || a.sport_type === 'Run')
        .map((a, i) => ({ ...a, _club: club, _seq: i }))
    }),
  )

  // Flatten: interleave clubs so we don't show 5 from the same club in a row
  const maxPerClub = 2
  const interleaved: ActivityWithClub[] = []
  for (let i = 0; i < maxPerClub; i++) {
    for (const clubActs of perClub) {
      if (clubActs[i]) interleaved.push(clubActs[i])
    }
  }
  const activities = interleaved.slice(0, 14)

  if (activities.length === 0) throw new Error('No run activities found across clubs')

  // 3. Map to RunningEvent
  const events: RunningEvent[] = activities.map((a, i) => ({
    id: `strava-${a._club.id}-${i}`,
    title: a.name,
    club: a._club.name,
    city: a._club.city || 'Barcelona',
    meetingPoint: a._club.city || 'Barcelona',
    // Timestamps go backwards from now — most recent activity first
    startsAt: recentTimestamp(i),
    durationMin: Math.round(a.moving_time / 60),
    pace: mToPace(a.distance, a.moving_time),
    distance: mToLabel(a.distance),
    type: 'club-run',
    hostedBy: `${a.athlete.firstname} ${a.athlete.lastname}`,
    attendees: a._club.member_count,
    signupUrl: `https://www.strava.com/clubs/${a._club.url}`,
    accent: ACCENTS[i % ACCENTS.length],
  }))

  const monday = startOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
    city: 'Barcelona',
    events,
    lastUpdated: new Date().toISOString(),
    source: `Live · Strava · ${runningClubs.length} clubs you follow`,
  }
}
