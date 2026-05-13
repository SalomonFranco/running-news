import type { RunningEvent, WeeklyAgenda, EventAccent } from './types'

/**
 * Mock weekly agenda — Barcelona running scene.
 * Events are generated relative to "today" so the live ticker
 * always has something upcoming to count down to.
 *
 * Real clubs (Bcn Run, Midnight Runners, etc.) used for authenticity.
 * Swap this file for a real API call in `app/api/events/route.ts`.
 */

function startOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday
  date.setHours(0, 0, 0, 0)
  date.setDate(diff)
  return date
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

function at(d: Date, hours: number, minutes = 0): Date {
  const r = new Date(d)
  r.setHours(hours, minutes, 0, 0)
  return r
}

const ACCENTS: EventAccent[] = ['coral', 'mint', 'lavender', 'butter', 'peach']

function build(): WeeklyAgenda {
  const now = new Date()
  const monday = startOfWeek(now)
  const sunday = addDays(monday, 6)

  // Mix of real Barcelona clubs + curated event names
  const seed: Omit<RunningEvent, 'id' | 'accent'>[] = [
    {
      title: 'Sunrise Loop · Barceloneta',
      club: 'Bcn Run Club',
      city: 'Barcelona',
      meetingPoint: 'Plaça del Mar, Barceloneta',
      startsAt: at(addDays(monday, 0), 7, 0).toISOString(),
      durationMin: 60,
      pace: '5:30/km',
      distance: '10K',
      type: 'club-run',
      attendees: 42,
      signupUrl: '#',
    },
    {
      title: 'Speedwork · Track Tuesday',
      club: 'Midnight Runners Barcelona',
      city: 'Barcelona',
      meetingPoint: 'Pista Municipal La Foixarda',
      startsAt: at(addDays(monday, 1), 19, 30).toISOString(),
      durationMin: 75,
      pace: 'Intervals · 4:30/km',
      distance: 'Intervals',
      type: 'club-run',
      attendees: 28,
      signupUrl: '#',
    },
    {
      title: 'Carretera de les Aigües · Trail Wednesday',
      club: 'Collserola Trail Crew',
      city: 'Barcelona',
      meetingPoint: 'Vallvidrera Inferior FGC',
      startsAt: at(addDays(monday, 2), 18, 30).toISOString(),
      durationMin: 90,
      pace: 'Conversational',
      distance: 'Trail',
      type: 'club-run',
      attendees: 19,
      signupUrl: '#',
    },
    {
      title: 'Long Run Workshop · Half Prep',
      club: 'Avilabs Running Society',
      city: 'Barcelona',
      meetingPoint: 'Parc de la Ciutadella, Arc',
      startsAt: at(addDays(monday, 3), 7, 30).toISOString(),
      durationMin: 105,
      pace: '5:45/km',
      distance: 'Half',
      type: 'workshop',
      hostedBy: 'Coach Mireia',
      attendees: 24,
      signupUrl: '#',
    },
    {
      title: 'Beachfront Sunset 5K',
      club: 'Friday Friends Run',
      city: 'Barcelona',
      meetingPoint: 'W Hotel, Passeig del Mare Nostrum',
      startsAt: at(addDays(monday, 4), 19, 0).toISOString(),
      durationMin: 50,
      pace: 'Easy',
      distance: '5K',
      type: 'social',
      attendees: 67,
      signupUrl: '#',
    },
    {
      title: 'Cursa dels Bombers · Race Day',
      club: 'Cursa de Bombers',
      city: 'Barcelona',
      meetingPoint: 'Av. Marià de Foronda',
      startsAt: at(addDays(monday, 5), 9, 0).toISOString(),
      durationMin: 80,
      pace: 'Race effort',
      distance: '10K',
      type: 'race',
      attendees: 1240,
      signupUrl: '#',
    },
    {
      title: 'Brunch & Easy 8K',
      club: 'Bcn Run Club',
      city: 'Barcelona',
      meetingPoint: 'Plaça de Sant Jaume',
      startsAt: at(addDays(monday, 6), 10, 0).toISOString(),
      durationMin: 75,
      pace: 'Conversational',
      distance: '10K',
      type: 'social',
      attendees: 53,
      signupUrl: '#',
    },
  ]

  // Deterministically assign accents so colour rhythm feels designed
  const events: RunningEvent[] = seed.map((e, i) => ({
    ...e,
    id: `evt-${monday.toISOString().slice(0, 10)}-${i}`,
    accent: ACCENTS[i % ACCENTS.length],
  }))

  return {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
    city: 'Barcelona',
    events,
    lastUpdated: new Date().toISOString(),
    source: 'Curated · API: mock (Strava/Eventbrite-ready)',
  }
}

export function getWeeklyAgenda(): WeeklyAgenda {
  return build()
}
