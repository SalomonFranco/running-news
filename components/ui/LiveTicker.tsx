'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { RunningEvent } from '@/lib/types'

interface Props {
  events: RunningEvent[]
}

function timeLabel(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff > 0) {
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(h / 24)
    if (d > 0) return `in ${d}d`
    if (h > 0) return `in ${h}h`
    return `in <1h`
  }
  const ago = Math.abs(diff)
  const h = Math.floor(ago / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'recent'
}

export default function LiveTicker({ events }: Props) {
  const [idx, setIdx] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (events.length === 0) return
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % events.length)
      setTick((x) => x + 1)
    }, 5000)
    return () => clearInterval(t)
  }, [events.length])

  if (!events.length) return null
  const e = events[idx]
  const isFuture = new Date(e.startsAt).getTime() > Date.now()

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="fixed top-5 left-4 sm:left-1/2 sm:-translate-x-1/2 z-50 w-[calc(100vw-2rem)] sm:w-[480px]"
    >
      <motion.div
        key={tick}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-rn-ink text-rn-base shadow-[0_8px_32px_-12px_rgba(14,14,20,0.35)] w-full"
        style={{ fontSize: '0.78rem' }}
      >
        <span className="relative flex items-center">
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-mint opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
        </span>
        <span className="tracking-[0.18em] uppercase font-medium text-mint">
          {isFuture ? 'Upcoming' : 'Recent'}
        </span>
        <span className="w-px h-3 bg-white/20" />
        <span className="font-medium truncate flex-1 min-w-0">{e.title}</span>
        <span className="w-px h-3 bg-white/20" />
        <span className="text-white/60 truncate max-w-[100px] hidden sm:inline">{e.club}</span>
        <span className="w-px h-3 bg-white/20 hidden sm:inline" />
        <span className="tabular-nums text-white/70 shrink-0">{timeLabel(e.startsAt)}</span>
      </motion.div>
    </motion.div>
  )
}
