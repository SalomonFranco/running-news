import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function fmtTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes()
  const mm = m < 10 ? `0${m}` : `${m}`
  return `${h}:${mm}`
}

export function fmtDay(iso: string): string {
  return DAY_NAMES[new Date(iso).getDay()]
}

export function fmtDayShort(iso: string): string {
  return SHORT_DAYS[new Date(iso).getDay()]
}

export function fmtDateLong(iso: string): string {
  const d = new Date(iso)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

export function timeUntil(iso: string): { h: number; m: number; isPast: boolean } {
  const target = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = target - now
  if (diffMs <= 0) return { h: 0, m: 0, isPast: true }
  const h = Math.floor(diffMs / 1000 / 60 / 60)
  const m = Math.floor((diffMs / 1000 / 60) % 60)
  return { h, m, isPast: false }
}

export function groupByDay<T extends { startsAt: string }>(events: T[]): Record<string, T[]> {
  return events.reduce<Record<string, T[]>>((acc, e) => {
    const key = e.startsAt.slice(0, 10)
    acc[key] = acc[key] || []
    acc[key].push(e)
    return acc
  }, {})
}
