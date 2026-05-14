import { createClient } from '@supabase/supabase-js'
import type { RunningEvent, EventAccent } from './types'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  )
}

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

const VALID_ACCENTS = new Set<EventAccent>(['coral', 'mint', 'lavender', 'butter', 'peach'])

export async function getInstagramEvents(): Promise<RunningEvent[]> {
  const supabase = getSupabaseClient()
  const now = new Date().toISOString()
  const windowEnd = new Date(Date.now() + 6 * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from('instagram_events')
    .select('id, title, club, meeting_point, starts_at, distance, description, post_url, accent')
    .gte('starts_at', now)
    .lte('starts_at', windowEnd)
    .order('starts_at', { ascending: true })

  if (error) throw new Error(`Supabase query failed: ${error.message}`)

  const rows = (data ?? []) as InstagramEventRow[]
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
