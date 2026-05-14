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

  let instagramEvents: RunningEvent[] = []
  let igSource = ''
  try {
    instagramEvents = await getInstagramEvents()
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
