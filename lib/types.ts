/**
 * Event domain model — designed to map cleanly onto real APIs:
 *  - Strava Club Events API (when OAuth is wired in)
 *  - Eventbrite Events API (`category=sports_fitness`)
 *  - RunSignup API
 *  - Meetup GraphQL
 *
 * `accent` is a presentation hint; the API layer decides which pastel
 * to assign so the UI palette feels intentional, not random.
 */

export type EventAccent = 'coral' | 'mint' | 'lavender' | 'butter' | 'peach'

export type EventType = 'club-run' | 'race' | 'workshop' | 'social'

export type Distance = '5K' | '10K' | 'Half' | 'Marathon' | 'Easy' | 'Intervals' | 'Trail' | (string & {})

export interface RunningEvent {
  id: string
  title: string
  club: string
  city: string
  meetingPoint: string
  startsAt: string        // ISO 8601
  durationMin: number
  pace?: string           // e.g. "5:30/km", "Easy", "Conversational"
  distance?: Distance
  type: EventType
  hostedBy?: string
  signupUrl?: string
  attendees?: number
  accent: EventAccent
}

export interface WeeklyAgenda {
  weekStart: string       // ISO date (Monday)
  weekEnd: string         // ISO date (Sunday)
  city: string
  events: RunningEvent[]
  lastUpdated: string
  source: string          // human label: "Curated · API: mock"
}
