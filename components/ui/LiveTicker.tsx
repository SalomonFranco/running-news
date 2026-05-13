'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { RunningEvent } from '@/lib/types'
import { timeUntil } from '@/lib/utils'

interface Props {
  events: RunningEvent[]
}

/**
 * Floating pill at the top — shows the next upcoming event with a live countdown.
 * Updates every 30s. Pulsing green dot signals "live data".
 */
export default function LiveTicker({ events }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  // Next upcoming
  const next = events
    .map((e) => ({ e, until: timeUntil(e.startsAt) }))
    .filter((x) => !x.until.isPast)
    .sort(
      (a, b) =>
        new Date(a.e.startsAt).getTime() - new Date(b.e.startsAt).getTime(),
    )[0]

  if (!next) return null
  const { e, until } = next

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
      key={tick} // re-render heartbeat
    >
      <div
        className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-rn-ink text-rn-base shadow-[0_8px_32px_-12px_rgba(14,14,20,0.35)] backdrop-blur-md"
        style={{ fontSize: '0.78rem' }}
      >
        {/* Live dot */}
        <span className="relative flex items-center">
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-mint opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
        </span>

        <span className="tracking-[0.18em] uppercase font-medium text-mint">
          Live
        </span>

        <span className="w-px h-3 bg-white/20" />

        <span className="text-white/70 hidden sm:inline">Next in</span>
        <span className="font-display font-semibold tabular-nums">
          {until.h > 0 ? `${until.h}h ` : ''}
          {until.m}m
        </span>

        <span className="w-px h-3 bg-white/20" />

        <span className="font-medium truncate max-w-[180px] sm:max-w-[280px]">
          {e.title}
        </span>
      </div>
    </motion.div>
  )
}
