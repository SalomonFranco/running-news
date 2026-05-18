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

interface StravaGroupEvent {
  id: number
  title: string
  description?: string
  club_id: number
  activity_type: string
  upcoming_occurrences: string[]   // ISO dates — may be past or future
  zone: string
  address?: string
  start_latlng?: [number, number] | null
  organizing_athlete?: { firstname: string; lastname: string }
  women_only: boolean
  private: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCENTS: EventAccent[] = ['coral', 'mint', 'lavender', 'butter', 'peach']

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
  const now = Date.now()

  // 1. Athlete's clubs
  const clubsRes = await fetch(
    'https://www.strava.com/api/v3/athlete/clubs?per_page=30',
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
  )
  if (!clubsRes.ok) throw new Error(`Clubs fetch failed: ${clubsRes.status}`)
  const allClubs: StravaClub[] = await clubsRes.json()
  const runningClubs = allClubs
  if (runningClubs.length === 0) throw new Error('No clubs found')

  // 2. Fetch group_events from every club in parallel
  const perClub = await Promise.all(
    runningClubs.map(async (club) => {
      const r = await fetch(
        `https://www.strava.com/api/v3/clubs/${club.id}/group_events?per_page=50`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
      )
      if (!r.ok) return { club, upcoming: [] as StravaGroupEvent[], recent: [] as StravaGroupEvent[] }
      const events: StravaGroupEvent[] = await r.json()
      if (!Array.isArray(events)) return { club, upcoming: [], recent: [] }

      // Split into truly upcoming vs most-recent past
      const upcoming = events
        .filter((e) => e.upcoming_occurrences?.some((d) => new Date(d).getTime() > now))
        .sort((a, b) => {
          const aNext = a.upcoming_occurrences.find((d) => new Date(d).getTime() > now)!
          const bNext = b.upcoming_occurrences.find((d) => new Date(d).getTime() > now)!
          return new Date(aNext).getTime() - new Date(bNext).getTime()
        })

      const recent = events
        .filter((e) => e.upcoming_occurrences?.every((d) => new Date(d).getTime() <= now))
        .sort((a, b) => {
          const aLast = Math.max(...a.upcoming_occurrences.map((d) => new Date(d).getTime()))
          const bLast = Math.max(...b.upcoming_occurrences.map((d) => new Date(d).getTime()))
          return bLast - aLast
        })
        .slice(0, 1)  // most recent past event per club

      return { club, upcoming, recent }
    }),
  )

  // 3. Merge: upcoming events first (sorted by date), then recent past per club
  type EventEntry = { club: StravaClub; event: StravaGroupEvent; date: string; isFuture: boolean }
  const entries: EventEntry[] = []

  for (const { club, upcoming, recent } of perClub) {
    for (const event of upcoming) {
      const date = event.upcoming_occurrences.find((d) => new Date(d).getTime() > now)!
      entries.push({ club, event, date, isFuture: true })
    }
    for (const event of recent) {
      const date = event.upcoming_occurrences.reduce((latest, d) =>
        new Date(d) > new Date(latest) ? d : latest,
      )
      entries.push({ club, event, date, isFuture: false })
    }
  }

  // Sort: future first (ascending), then past (descending by recency)
  entries.sort((a, b) => {
    if (a.isFuture && !b.isFuture) return -1
    if (!a.isFuture && b.isFuture) return 1
    if (a.isFuture) return new Date(a.date).getTime() - new Date(b.date).getTime()
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const top = entries
  if (top.length === 0) throw new Error('No group events found across clubs')

  // 4. Map to RunningEvent
  const events: RunningEvent[] = top.map(({ club, event, date, isFuture }, i) => {
    const organizer = event.organizing_athlete
    return {
      id: `strava-${event.id}`,
      title: event.title,
      club: club.name,
      city: club.city || 'Barcelona',
      meetingPoint: event.address || club.city || 'See club page',
      startsAt: date,
      durationMin: 60,   // Strava events don't include duration
      type: isFuture ? 'club-run' : 'social',
      hostedBy: organizer ? `${organizer.firstname} ${organizer.lastname}` : club.name,
      attendees: club.member_count,
      signupUrl: `https://www.strava.com/clubs/${club.url}`,
      accent: ACCENTS[i % ACCENTS.length],
    }
  })

  const upcomingCount = top.filter((e) => e.isFuture).length
  const monday = startOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
    city: 'Barcelona',
    events,
    lastUpdated: new Date().toISOString(),
    source: `Live · Strava · ${upcomingCount} upcoming · ${top.length - upcomingCount} recent`,
  }
}
