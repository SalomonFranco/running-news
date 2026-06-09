'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import EventCard from '@/components/ui/EventCard'
import type { WeeklyAgenda } from '@/lib/types'
import { fmtDay, fmtDateLong, fmtTime, groupByDay } from '@/lib/utils'

const SkeletonCard = () => (
  <div className="rounded-3xl h-[280px] bg-rn-ink/[0.04] relative overflow-hidden">
    <div
      className="absolute inset-0 animate-shimmer"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(14,14,20,0.05) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  </div>
)

/**
 * Weekly agenda — fetches from /api/events, groups by day,
 * renders asymmetric grid of tilted EventCards.
 */
export default function Agenda() {
  const [data, setData] = useState<WeeklyAgenda | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetch('/api/events')
      .then((r) => {
        if (!r.ok) throw new Error('Network error')
        return r.json()
      })
      .then((d: WeeklyAgenda) => {
        if (live) {
          setData(d)
          setLoading(false)
        }
      })
      .catch((e: Error) => {
        if (live) {
          setError(e.message)
          setLoading(false)
        }
      })
    return () => {
      live = false
    }
  }, [])

  const days = data ? groupByDay(data.events) : {}
  const dayKeys = Object.keys(days).sort()

  return (
    <section id="agenda" className="relative py-24 lg:py-36">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-[0.22em] text-rn-muted font-medium">
                Today + next 7 days
              </span>
              <div className="w-12 h-px bg-rn-line" />
            </div>
            <h2
              className="font-display font-bold text-rn-ink tracking-[-0.025em] leading-[0.95]"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Roads are
              <br />
              <span className="italic text-coral">always open.</span>
            </h2>
          </div>

        </motion.header>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-rn-line rounded-3xl p-10 text-center">
            <p className="text-rn-muted">
              Couldn't load events. Try refreshing.
            </p>
          </div>
        )}

        {/* Day-grouped agenda */}
        {!loading && !error && data && (
          <div className="space-y-16 lg:space-y-20">
            {dayKeys.map((dayKey) => {
              const dayEvents = days[dayKey]
              const firstStart = dayEvents[0].startsAt
              return (
                <div key={dayKey}>
                  {/* Day header */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-baseline gap-6 mb-7"
                  >
                    <h3
                      className="font-display font-semibold text-rn-ink tracking-tight leading-none"
                      style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                    >
                      {fmtDay(firstStart)}
                    </h3>
                    <span className="text-rn-muted text-sm font-medium tracking-wide">
                      {fmtDateLong(firstStart)} · {dayEvents.length} event
                      {dayEvents.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-px bg-rn-line" />
                  </motion.div>

                  {/* Asymmetric grid: 1 big, 2 small — varies per day */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {dayEvents.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
