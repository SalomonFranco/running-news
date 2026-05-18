import type { RunningEvent, EventAccent } from './types'

/**
 * Real recurring running club schedule for Barcelona.
 * Days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
 */

interface RecurringSlot {
  club: string
  title: string
  meetingPoint: string
  days: number[]          // day-of-week indices
  hour: number
  minute: number
  durationMin: number
  distance?: string
  pace?: string
  type: RunningEvent['type']
  accent: EventAccent
  signupUrl?: string
  attendeesApprox: number
}

const SLOTS: RecurringSlot[] = [
  {
    club: 'Parkrun Barceloneta',
    title: 'Parkrun Barceloneta · Timed 5K',
    meetingPoint: 'Barceloneta seafront promenade',
    days: [6], // Saturday
    hour: 9, minute: 0, durationMin: 40,
    distance: '5K', pace: 'All paces',
    type: 'race',
    accent: 'coral',
    signupUrl: 'https://www.parkrun.es/barceloneta/',
    attendeesApprox: 200,
  },
  {
    club: 'Adidas Runners Barcelona',
    title: 'Adidas Runners · Tuesday Session',
    meetingPoint: 'Check @runners.barcelona on Instagram',
    days: [2], // Tuesday
    hour: 19, minute: 30, durationMin: 60,
    distance: '8K', pace: '5:30/km',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/runners.barcelona/',
    attendeesApprox: 120,
  },
  {
    club: 'Adidas Runners Barcelona',
    title: 'Adidas Runners · Wednesday Session',
    meetingPoint: 'Check @runners.barcelona on Instagram',
    days: [3], // Wednesday
    hour: 19, minute: 30, durationMin: 60,
    distance: '8K', pace: '5:30/km',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/runners.barcelona/',
    attendeesApprox: 120,
  },
  {
    club: 'Adidas Runners Barcelona',
    title: 'Adidas Runners · Thursday Session',
    meetingPoint: 'Check @runners.barcelona on Instagram',
    days: [4], // Thursday
    hour: 19, minute: 30, durationMin: 60,
    distance: '8K', pace: '5:30/km',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/runners.barcelona/',
    attendeesApprox: 120,
  },
  {
    club: 'Midnight Runners Barcelona',
    title: 'Midnight Runners · Bootcamp 6K',
    meetingPoint: 'Check Heylo app or @midnightrunnersbarcelona',
    days: [3], // Wednesday
    hour: 20, minute: 0, durationMin: 75,
    distance: '6K', pace: 'Intervals + music',
    type: 'social',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/midnightrunnersbarcelona/',
    attendeesApprox: 85,
  },
  {
    club: 'B3TTER Run Club',
    title: 'B3TTER Run Club · Morning 5–10K',
    meetingPoint: 'La Cala, Barceloneta',
    days: [2], // Tuesday
    hour: 7, minute: 0, durationMin: 65,
    distance: '5–10K', pace: 'Conversational',
    type: 'club-run',
    accent: 'butter',
    signupUrl: 'https://www.instagram.com/b3tterrunclub/',
    attendeesApprox: 50,
  },
  {
    club: 'Ordinary Run Club',
    title: 'Ordinary Run Club · Social 5K',
    meetingPoint: 'Check @ordinaryrunclub on Instagram for weekly point',
    days: [2], // Tuesday
    hour: 19, minute: 0, durationMin: 50,
    distance: '5K', pace: 'All paces',
    type: 'social',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/ordinaryrunclub/',
    attendeesApprox: 40,
  },
  {
    club: 'Club Rodeo',
    title: 'Club Rodeo · Tuesday 5K',
    meetingPoint: 'Nudes — Carrer del Rec 10',
    days: [2], // Tuesday
    hour: 19, minute: 0, durationMin: 45,
    distance: '5K',
    type: 'club-run',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/club__rodeo/',
    attendeesApprox: 20,
  },
  {
    club: 'Barcelona Casual Runners',
    title: 'Barcelona Casual Runners · Parc Ciutadella',
    meetingPoint: 'Parc de la Ciutadella entrance',
    days: [2, 4], // Tuesday & Thursday
    hour: 20, minute: 0, durationMin: 60,
    distance: '5–7K', pace: 'Easy',
    type: 'social',
    accent: 'mint',
    signupUrl: 'https://www.meetup.com/barcelona-casual-runners/',
    attendeesApprox: 30,
  },
]

// Returns Europe/Madrid UTC offset in hours for a given date (+1 CET / +2 CEST).
// Works correctly regardless of server timezone so Vercel (UTC) and local match.
function madridOffset(date: Date): number {
  const noon = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
  const h = parseInt(
    noon.toLocaleString('en-US', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false }),
  )
  return h - 12 // 14 - 12 = +2 in summer, 13 - 12 = +1 in winter
}

// Builds a UTC Date for a specific Madrid local time on a given calendar day.
function madridDateTime(calendarDay: Date, hour: number, minute: number): Date {
  const offset = madridOffset(calendarDay)
  return new Date(Date.UTC(
    calendarDay.getFullYear(),
    calendarDay.getMonth(),
    calendarDay.getDate(),
    hour - offset,
    minute,
    0,
  ))
}

// Rolling 8-day window: today + the next 7 days.
// Because the schedule is weekly-recurring, this always returns the correct
// real-world dates no matter what day you visit the site.
export function getWeeklySchedule(): RunningEvent[] {
  const now = new Date()
  // Calendar "today" in Madrid timezone — determines which day-of-week we're on
  const todayMadrid = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }),
  )
  todayMadrid.setHours(0, 0, 0, 0)

  const events: RunningEvent[] = []

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    // Build the calendar day for this offset (UTC midnight, safe for date math)
    const calDay = new Date(Date.UTC(
      todayMadrid.getFullYear(),
      todayMadrid.getMonth(),
      todayMadrid.getDate() + dayOffset,
    ))
    const dayOfWeek = new Date(
      calDay.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }),
    ).getDay()  // 0=Sun … 6=Sat in Madrid timezone

    for (const slot of SLOTS) {
      if (!slot.days.includes(dayOfWeek)) continue

      const eventTime = madridDateTime(calDay, slot.hour, slot.minute)

      // On the first day (today) skip events that have already started
      if (dayOffset === 0 && eventTime.getTime() < now.getTime()) continue

      events.push({
        id: `schedule-${slot.club.replace(/\s+/g, '-').toLowerCase()}-${calDay.toISOString().slice(0, 10)}`,
        title: slot.title,
        club: slot.club,
        city: 'Barcelona',
        meetingPoint: slot.meetingPoint,
        startsAt: eventTime.toISOString(),
        durationMin: slot.durationMin,
        distance: slot.distance,
        pace: slot.pace,
        type: slot.type,
        attendees: slot.attendeesApprox,
        signupUrl: slot.signupUrl,
        accent: slot.accent,
      })
    }
  }

  // Sort by start time
  return events.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
}
