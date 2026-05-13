import { NextResponse } from 'next/server'
import { getWeeklyAgenda } from '@/lib/mockEvents'

/**
 * GET /api/events
 *
 * Returns the current week's running agenda for the user's city.
 *
 * Wire real data here:
 *   - Strava Club Activities API (requires OAuth):
 *       https://developers.strava.com/docs/reference/#api-Clubs
 *   - Eventbrite Search API (category=sports_fitness, subcategory=running):
 *       https://www.eventbrite.com/platform/api
 *   - RunSignup REST API:
 *       https://runsignup.com/API
 *
 * For now, returns curated mock data so the UI ships immediately
 * with realistic content. ISR via `revalidate` keeps it fresh.
 */
export const revalidate = 600 // 10 min cache — match a real API rate-limit budget

export async function GET() {
  const agenda = getWeeklyAgenda()
  return NextResponse.json(agenda, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
