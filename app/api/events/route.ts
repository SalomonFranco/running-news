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

const BLOCKED_CLUBS = new Set([
  'nike run club barcelona',
  'nike run club',
  'good soles run club',
])

function isBlocked(club: string) {
  return BLOCKED_CLUBS.has(club.toLowerCase().trim())
}

export async function GET() {
  const today = new Date()
  const windowEnd = addDays(today, 6)
  windowEnd.setHours(23, 59, 59, 999)
  const windowEndMs = windowEnd.getTime()

  const scheduleEvents = getWeeklySchedule()

  let stravaEvents: RunningEvent[] = []
  let stravaSource = ''
  try {
    const agenda = await getStravaAgenda()
    stravaEvents = agenda.events.filter((e) => {
      const t = new Date(e.startsAt).getTime()
      return t > Date.now() && t <= windowEndMs && !isBlocked(e.club)
    })
    stravaSource = stravaEvents.length > 0
      ? ` · ${stravaEvents.length} confirmed on Strava`
      : ''
  } catch { /* Strava down — continue */ }

  let instagramEvents: RunningEvent[] = []
  let igSource = ''
  try {
    instagramEvents = (await getInstagramEvents()).filter((e) => !isBlocked(e.club))
    igSource = instagramEvents.length > 0
      ? ` · ${instagramEvents.length} from Instagram`
      : ''
  } catch { /* Supabase down — continue */ }

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
  ]
    .filter((e) => new Date(e.startsAt).getTime() <= windowEndMs)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const payload: WeeklyAgenda = {
    weekStart: today.toISOString(),
    weekEnd: windowEnd.toISOString(),
    city: 'Barcelona',
    events: merged,
    lastUpdated: new Date().toISOString(),
    source: `Recurring schedule · 8 clubs${igSource}${stravaSource}`,
  }

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
