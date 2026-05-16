import type { RunningEvent, EventAccent } from './types'

interface InstagramEventRow {
  id: string
  title: string
  club: string
  meeting_point: string | null
  starts_at: string
  distance: string | null
  post_url: string
  accent: string
}

const VALID_ACCENTS = new Set<EventAccent>(['coral', 'mint', 'lavender', 'butter', 'peach'])

export async function getInstagramEvents(): Promise<RunningEvent[]> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')

  const now = new Date().toISOString()
  const windowEnd = new Date(Date.now() + 6 * 86_400_000).toISOString()

  const params = new URLSearchParams({
    select: 'id,title,club,meeting_point,starts_at,distance,post_url,accent',
    starts_at: `gte.${now}`,
    order: 'starts_at.asc',
  })
  params.append('starts_at', `lte.${windowEnd}`)

  const res = await fetch(`${url}/rest/v1/instagram_events?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    next: { revalidate: 600 },
  })

  if (!res.ok) throw new Error(`Supabase query failed: ${res.status}`)

  const rows: InstagramEventRow[] = await res.json()

  return rows
    .filter((row) => row.id && row.title && row.club && row.starts_at && row.post_url)
    .map((row) => ({
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
      accent: (VALID_ACCENTS.has(row.accent as EventAccent) ? row.accent : 'coral') as EventAccent,
    }))
}
