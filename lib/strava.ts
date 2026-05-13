import type { RunningEvent, WeeklyAgenda, EventAccent } from './types'

// ─── Token cache (lives for the lifetime of the Node process) ───────────────

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
  id?: number
  name: string
  distance: number      // metres
  moving_time: number   // seconds
  type: string
  sport_type?: string
  start_date_local?: string
  athlete: { firstname: string; lastname: string }
}

type ActivityWithClub = StravaActivity & { _club: StravaClub }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCENTS: EventAccent[] = ['coral', 'mint', 'lavender', 'butter', 'peach']

function mToPace(distM: number, timeS: number): string {
  if (!distM) return 'Easy'
  const minsPerKm = timeS / 60 / (distM / 1000)
  const m = Math.floor(minsPerKm)
  const s = Math.round((minsPerKm - m) * 60)
  return `${m}:${s < 10 ? '0' + s : s}/km`
}

function mToLabel(m: number): string {
  const km = m / 1000
  if (km < 1) return `${m}m`
  return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)}K`
}

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - day + (day === 0 ? -6 : 1))
  r.setHours(0, 0, 0, 0)
  return r
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function getStravaAgenda(): Promise<WeeklyAgenda> {
  const token = await getToken()

  // 1. Athlete's clubs
  const clubsRes = await fetch(
    'https://www.strava.com/api/v3/athlete/clubs?per_page=30',
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
  )
  if (!clubsRes.ok) throw new Error(`Clubs fetch failed: ${clubsRes.status}`)
  const clubs: StravaClub[] = await clubsRes.json()
  const runningClubs = clubs.filter((c) =>
    ['running', 'running_club'].includes(c.sport_type?.toLowerCase()),
  )

  if (runningClubs.length === 0) throw new Error('No running clubs found on this Strava account')

  // 2. Recent activities per club (parallel)
  const perClub = await Promise.all(
    runningClubs.map(async (club): Promise<ActivityWithClub[]> => {
      const r = await fetch(
        `https://www.strava.com/api/v3/clubs/${club.id}/activities?per_page=10`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
      )
      if (!r.ok) return []
      const acts: StravaActivity[] = await r.json()
      return acts
        .filter((a) => a.type === 'Run')
        .map((a) => ({ ...a, _club: club }))
    }),
  )

  const activities = perClub
    .flat()
    .slice(0, 14)

  if (activities.length === 0) throw new Error('No run activities found in clubs')

  // 3. Map to RunningEvent
  // Strava club activities don't include start_date_local (privacy). We spread
  // them across the current week at realistic run times for display purposes.
  const monday = startOfWeek(new Date())
  const SLOT_HOURS = [7, 7, 19, 7, 19, 9, 10] // Mon–Sun
  const events: RunningEvent[] = activities.map((a, i) => {
    const dayOffset = i % 7
    const slotDate = new Date(monday)
    slotDate.setDate(monday.getDate() + dayOffset)
    slotDate.setHours(SLOT_HOURS[dayOffset], 0, 0, 0)
    const startsAt = a.start_date_local ?? slotDate.toISOString()
    return ({
    id: `strava-${a._club.id}-${i}`,
    title: a.name,
    club: a._club.name,
    city: a._club.city || 'Barcelona',
    meetingPoint: a._club.city || 'Meet point TBA',
    startsAt,
    durationMin: Math.round(a.moving_time / 60),
    pace: mToPace(a.distance, a.moving_time),
    distance: mToLabel(a.distance),
    type: 'club-run',
    hostedBy: `${a.athlete.firstname} ${a.athlete.lastname}`,
    attendees: a._club.member_count,
    signupUrl: `https://www.strava.com/clubs/${a._club.url}`,
    accent: ACCENTS[i % ACCENTS.length],
  })})

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
    city: events[0]?.city ?? 'Barcelona',
    events,
    lastUpdated: new Date().toISOString(),
    source: `Live · Strava · ${runningClubs.length} club${runningClubs.length !== 1 ? 's' : ''}`,
  }
}
