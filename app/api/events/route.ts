import { NextResponse } from 'next/server'
import { getStravaAgenda } from '@/lib/strava'
import { getWeeklyAgenda } from '@/lib/mockEvents'

export const revalidate = 600

export async function GET() {
  try {
    const agenda = await getStravaAgenda()
    return NextResponse.json(agenda, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    console.warn('[/api/events] Strava unavailable, falling back to mock:', (err as Error).message)
    const agenda = getWeeklyAgenda()
    return NextResponse.json(agenda, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  }
}
