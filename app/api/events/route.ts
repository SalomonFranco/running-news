import { NextResponse } from 'next/server'
import { getStravaAgenda } from '@/lib/strava'
import { getWeeklySchedule } from '@/lib/weeklySchedule'
import type { RunningEvent, WeeklyAgenda } from '@/lib/types'

export const revalidate = 600

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - day + (day === 0 ? -6 : 1))
  r.setHours(0, 0, 0, 0)
  return r
}

export async function GET() {
  // 1. Weekly schedule — always works, no network needed
  const scheduleEvents = getWeeklySchedule()

  // 2. Strava confirmed events — real group events from followed clubs
  let stravaEvents: RunningEvent[] = []
  let stravaSource = ''
  try {
    const agenda = await getStravaAgenda()
    // Only take upcoming Strava events (future dates) — they override the schedule
    stravaEvents = agenda.events.filter(
      (e) => new Date(e.startsAt).getTime() > Date.now(),
    )
    stravaSource = stravaEvents.length > 0
      ? ` · ${stravaEvents.length} confirmed on Strava`
      : ''
  } catch {
    // Strava down — schedule still shows
  }

  // 3. Merge: Strava upcoming events first, then weekly schedule
  //    Deduplicate by club+day so a Strava event doesn't double with the schedule
  const stravaClubDays = new Set(
    stravaEvents.map((e) => {
      const d = new Date(e.startsAt)
      return `${e.club}-${d.toDateString()}`
    }),
  )

  const filteredSchedule = scheduleEvents.filter((e) => {
    const d = new Date(e.startsAt)
    return !stravaClubDays.has(`${e.club}-${d.toDateString()}`)
  })

  const merged: RunningEvent[] = [
    ...stravaEvents,
    ...filteredSchedule,
  ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const monday = startOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const payload: WeeklyAgenda = {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
    city: 'Barcelona',
    events: merged,
    lastUpdated: new Date().toISOString(),
    source: `Recurring schedule · 8 Barcelona clubs${stravaSource}`,
  }

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' },
  })
}
