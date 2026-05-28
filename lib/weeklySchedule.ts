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
    club: 'Good Soles Run Club',
    title: 'Good Soles Run Club · Tuesday Run',
    meetingPoint: 'Check @goodsolesrunclub on Instagram',
    days: [2], // Tuesday
    hour: 19, minute: 30, durationMin: 60,
    type: 'club-run',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/goodsolesrunclub/',
    attendeesApprox: 30,
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
    club: 'Casual Runners',
    title: 'Casual Runners · Tuesday 10K',
    meetingPoint: 'Passeig Pujades 33',
    days: [2], // Tuesday only
    hour: 19, minute: 30, durationMin: 70,
    distance: '10K', pace: 'All paces',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/casualrunners/',
    attendeesApprox: 50,
  },
  // Monday
  {
    club: 'Spaceship Running',
    title: 'Spaceship Running · Morning 8K',
    meetingPoint: 'Avenir 68',
    days: [1],
    hour: 8, minute: 0, durationMin: 60,
    distance: '8K',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/spaceshiprunning/',
    attendeesApprox: 30,
  },
  {
    club: 'BCN Digital Nomads',
    title: 'BCN Digital Nomads · Monday 5K',
    meetingPoint: 'La Carioca',
    days: [1],
    hour: 19, minute: 0, durationMin: 40,
    distance: '5K',
    type: 'social',
    accent: 'coral',
    signupUrl: 'https://www.instagram.com/bcndigitalnomads/',
    attendeesApprox: 25,
  },
  // Tuesday
  {
    club: 'Cabrona de Barri',
    title: 'Cabrona de Barri · Tuesday 6K',
    meetingPoint: 'Almogàvers 60',
    days: [2],
    hour: 19, minute: 45, durationMin: 50,
    distance: '6K',
    type: 'social',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/cabronabarri/',
    attendeesApprox: 35,
  },
  {
    club: 'The Edge Mood',
    title: 'The Edge Mood · Tuesday Run',
    meetingPoint: 'Sagués 16',
    days: [2],
    hour: 19, minute: 30, durationMin: 55,
    distance: '6K–7K',
    type: 'social',
    accent: 'butter',
    signupUrl: 'https://www.instagram.com/theedgemood/',
    attendeesApprox: 30,
  },
  {
    club: 'Primetime Run',
    title: 'Primetime Run · Late Night 6K',
    meetingPoint: 'Francesc Macià',
    days: [2],
    hour: 20, minute: 30, durationMin: 50,
    distance: '6K',
    type: 'social',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/primetimerun/',
    attendeesApprox: 25,
  },
  // Wednesday
  {
    club: 'Fun Runners',
    title: 'Fun Runners · Wednesday 10K',
    meetingPoint: 'Pg. Marítim del Bogatell 115',
    days: [3],
    hour: 19, minute: 30, durationMin: 70,
    distance: '10K',
    type: 'club-run',
    accent: 'coral',
    signupUrl: 'https://www.instagram.com/funrunners/',
    attendeesApprox: 40,
  },
  {
    club: 'Half Runners',
    title: 'Half Runners · Wednesday Half Run',
    meetingPoint: 'Passeig Picasso 14',
    days: [3],
    hour: 19, minute: 30, durationMin: 65,
    distance: '7K–10K',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/halfrunners/',
    attendeesApprox: 35,
  },
  // Thursday
  {
    club: 'Gravity Run',
    title: 'Gravity Run · Thursday 7.5K',
    meetingPoint: 'Check @gravityrun on Instagram',
    days: [4],
    hour: 19, minute: 30, durationMin: 55,
    distance: '7.5K',
    type: 'club-run',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/gravityrun/',
    attendeesApprox: 25,
  },
  // Friday
  {
    club: 'Las Pasteles Run',
    title: 'Las Pasteles Run · Friday 5K',
    meetingPoint: 'Arc de Triomf',
    days: [5],
    hour: 9, minute: 25, durationMin: 40,
    distance: '5K',
    type: 'social',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/laspastelasrun/',
    attendeesApprox: 40,
  },
  // Saturday
  {
    club: 'Culitos Inquietos',
    title: 'Culitos Inquietos · Saturday 6K',
    meetingPoint: 'Mystika Centro Holístico',
    days: [6],
    hour: 9, minute: 0, durationMin: 50,
    distance: '6K',
    type: 'club-run',
    accent: 'butter',
    signupUrl: 'https://www.instagram.com/culitosinquietos/',
    attendeesApprox: 30,
  },
  {
    club: 'Founders Running Club',
    title: 'Founders Running Club · Saturday Run',
    meetingPoint: "c/ de l'Escar, 18",
    days: [6],
    hour: 9, minute: 0, durationMin: 60,
    distance: '5K–10K',
    type: 'club-run',
    accent: 'coral',
    signupUrl: 'https://www.instagram.com/foundersrunningclub/',
    attendeesApprox: 50,
  },
  {
    club: 'Galactic Run',
    title: 'Galactic Run · Saturday 6–12K',
    meetingPoint: 'Princesa 28',
    days: [6],
    hour: 9, minute: 0, durationMin: 70,
    distance: '6K–12K',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/galacticrun/',
    attendeesApprox: 45,
  },
  {
    club: 'Saturnday Run Club',
    title: 'Saturnday Run Club · Saturday 6K',
    meetingPoint: 'Enric Granados 98',
    days: [6],
    hour: 10, minute: 0, durationMin: 50,
    distance: '6K',
    type: 'social',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/saturdayrunclub/',
    attendeesApprox: 35,
  },
  // Sunday
  {
    club: 'Sunrise Runners Club',
    title: 'Sunrise Runners Club · Sunday Run',
    meetingPoint: 'Plaça del Mar 1',
    days: [0],
    hour: 7, minute: 30, durationMin: 60,
    distance: '5K–10K',
    type: 'club-run',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/sunriserunnersclub/',
    attendeesApprox: 20,
  },
  {
    club: 'BCN Digital Nomads',
    title: 'BCN Digital Nomads · Monday 5K',
    meetingPoint: 'La Carioca',
    days: [1],
    hour: 19, minute: 0, durationMin: 40,
    distance: '5K',
    type: 'social',
    accent: 'coral',
    signupUrl: 'https://www.instagram.com/bcndigitalnomads/',
    attendeesApprox: 25,
  },
  // Tuesday
  {
    club: 'Cabrona de Barri',
    title: 'Cabrona de Barri · Tuesday 6K',
    meetingPoint: 'Almogàvers 60',
    days: [2],
    hour: 19, minute: 45, durationMin: 50,
    distance: '6K',
    type: 'social',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/cabronabarri/',
    attendeesApprox: 35,
  },
  {
    club: 'The Edge Mood',
    title: 'The Edge Mood · Tuesday Run',
    meetingPoint: 'Sagués 16',
    days: [2],
    hour: 19, minute: 30, durationMin: 55,
    distance: '6K–7K',
    type: 'social',
    accent: 'butter',
    signupUrl: 'https://www.instagram.com/theedgemood/',
    attendeesApprox: 30,
  },
  {
    club: 'Primetime Run',
    title: 'Primetime Run · Late Night 6K',
    meetingPoint: 'Francesc Macià',
    days: [2],
    hour: 20, minute: 30, durationMin: 50,
    distance: '6K',
    type: 'social',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/primetimerun/',
    attendeesApprox: 25,
  },
  // Wednesday
  {
    club: 'Fun Runners',
    title: 'Fun Runners · Wednesday 10K',
    meetingPoint: 'Pg. Marítim del Bogatell 115',
    days: [3],
    hour: 19, minute: 30, durationMin: 70,
    distance: '10K',
    type: 'club-run',
    accent: 'coral',
    signupUrl: 'https://www.instagram.com/funrunners/',
    attendeesApprox: 40,
  },
  {
    club: 'Half Runners',
    title: 'Half Runners · Wednesday Half Run',
    meetingPoint: 'Passeig Picasso 14',
    days: [3],
    hour: 19, minute: 30, durationMin: 65,
    distance: '7K–10K',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/halfrunners/',
    attendeesApprox: 35,
  },
  // Thursday
  {
    club: 'Gravity Run',
    title: 'Gravity Run · Thursday 7.5K',
    meetingPoint: 'Check @gravityrun on Instagram',
    days: [4],
    hour: 19, minute: 30, durationMin: 55,
    distance: '7.5K',
    type: 'club-run',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/gravityrun/',
    attendeesApprox: 25,
  },
  // Friday
  {
    club: 'Las Pasteles Run',
    title: 'Las Pasteles Run · Friday 5K',
    meetingPoint: 'Arc de Triomf',
    days: [5],
    hour: 9, minute: 25, durationMin: 40,
    distance: '5K',
    type: 'social',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/laspastelasrun/',
    attendeesApprox: 40,
  },
  // Saturday
  {
    club: 'Culitos Inquietos',
    title: 'Culitos Inquietos · Saturday 6K',
    meetingPoint: 'Mystika Centro Holístico',
    days: [6],
    hour: 9, minute: 0, durationMin: 50,
    distance: '6K',
    type: 'club-run',
    accent: 'butter',
    signupUrl: 'https://www.instagram.com/culitosinquietos/',
    attendeesApprox: 30,
  },
  {
    club: 'Founders Running Club',
    title: 'Founders Running Club · Saturday Run',
    meetingPoint: "c/ de l'Escar, 18",
    days: [6],
    hour: 9, minute: 0, durationMin: 60,
    distance: '5K–10K',
    type: 'club-run',
    accent: 'coral',
    signupUrl: 'https://www.instagram.com/foundersrunningclub/',
    attendeesApprox: 50,
  },
  {
    club: 'Galactic Run',
    title: 'Galactic Run · Saturday 6–12K',
    meetingPoint: 'Princesa 28',
    days: [6],
    hour: 9, minute: 0, durationMin: 70,
    distance: '6K–12K',
    type: 'club-run',
    accent: 'mint',
    signupUrl: 'https://www.instagram.com/galacticrun/',
    attendeesApprox: 45,
  },
  {
    club: 'Saturnday Run Club',
    title: 'Saturnday Run Club · Saturday 6K',
    meetingPoint: 'Enric Granados 98',
    days: [6],
    hour: 10, minute: 0, durationMin: 50,
    distance: '6K',
    type: 'social',
    accent: 'lavender',
    signupUrl: 'https://www.instagram.com/saturdayrunclub/',
    attendeesApprox: 35,
  },
  // Sunday
  {
    club: 'Sunrise Runners Club',
    title: 'Sunrise Runners Club · Sunday Run',
    meetingPoint: 'Plaça del Mar 1',
    days: [0],
    hour: 7, minute: 30, durationMin: 60,
    distance: '5K–10K',
    type: 'club-run',
    accent: 'peach',
    signupUrl: 'https://www.instagram.com/sunriserunnersclub/',
    attendeesApprox: 20,
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
