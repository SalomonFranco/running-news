'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Clock, MapPin, Users, Lightning } from '@phosphor-icons/react'
import type { RunningEvent, EventAccent } from '@/lib/types'
import { fmtTime } from '@/lib/utils'

interface Props {
  event: RunningEvent
  index: number
}

/**
 * Hero card with 3D tilt on hover.
 *
 * Tracks cursor via useMotionValue (zero re-renders, per Apple WWDC
 * "one-to-one tracking"), feeds into spring physics, drives rotateX
 * and rotateY plus a parallaxed highlight glow.
 *
 * Per "7 Practical Animation Tips" Tip #1: scale(0.97) on press.
 * Per "Easing Blueprint": springs for amplified output (Apple amplification).
 */

const ACCENT_BG: Record<EventAccent, string> = {
  coral:    'var(--coral)',
  mint:     'var(--mint)',
  lavender: 'var(--lavender)',
  butter:   'var(--butter)',
  peach:    'var(--peach)',
}

const TYPE_LABEL: Record<RunningEvent['type'], string> = {
  'club-run': 'Club run',
  'race':     'Race',
  'workshop': 'Workshop',
  'social':   'Social',
}

export default function EventCard({ event, index }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduceMotion = useReducedMotion()

  // Raw mouse position relative to card (-0.5 .. 0.5)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  // Spring-smoothed
  const smx = useSpring(mx, { stiffness: 150, damping: 18 })
  const smy = useSpring(my, { stiffness: 150, damping: 18 })

  // Drive tilt
  const rotateY = useTransform(smx, [-0.5, 0.5], [-9, 9])
  const rotateX = useTransform(smy, [-0.5, 0.5], [7, -7])

  // Drive light reflection (parallax highlight)
  const glareX = useTransform(smx, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(smy, [-0.5, 0.5], ['0%', '100%'])

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  // Only treat as a navigable link when there's a real destination.
  const href =
    event.signupUrl && event.signupUrl !== '#' ? event.signupUrl : undefined
  const isExternal = href?.startsWith('http')

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.8,
        delay: 0.05 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 1200 }}
    >
      <motion.a
        ref={ref}
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-label={`${event.title} — ${event.club}${href ? ', view details' : ''}`}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onMouseDown={(e) => (e.currentTarget.style.scale = '0.985')}
        onMouseUp={(e) => (e.currentTarget.style.scale = '1')}
        data-cursor="hover"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          background: ACCENT_BG[event.accent],
          transition: 'scale 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative block rounded-3xl p-7 lg:p-8 overflow-hidden grain h-full min-h-[280px] flex flex-col ${
          href ? 'cursor-pointer' : ''
        }`}
      >
        {/* Spec-light reflection — parallax highlight following cursor */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) =>
                `radial-gradient(280px circle at ${x} ${y}, rgba(255,255,255,0.4), transparent 60%)`,
            ),
            mixBlendMode: 'overlay',
          }}
        />

        {/* Top row: type pill + time */}
        <header className="flex items-start justify-between mb-7 relative z-10">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rn-ink/90 text-rn-base text-[10px] tracking-[0.18em] uppercase font-medium"
          >
            <Lightning size={10} weight="fill" />
            {TYPE_LABEL[event.type]}
          </span>
          <div className="text-right">
            <div className="font-display font-bold text-rn-ink text-2xl lg:text-[28px] leading-none tabular-nums tracking-tight">
              {fmtTime(event.startsAt)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-rn-ink/60 mt-1">
              {event.durationMin} min
            </div>
          </div>
        </header>

        {/* Title */}
        <div className="flex-1 relative z-10">
          <h3 className="font-display font-semibold text-rn-ink text-xl lg:text-[22px] leading-[1.15] tracking-tight mb-2">
            {event.title}
          </h3>
          <p className="text-rn-ink/70 text-sm font-medium">{event.club}</p>
        </div>

        {/* Meta row */}
        <footer className="mt-6 pt-5 border-t border-rn-ink/15 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 text-[11px] text-rn-ink/70 font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={12} weight="bold" />
              <span className="truncate max-w-[140px]">{event.meetingPoint}</span>
            </span>
            {event.attendees != null && (
              <span className="flex items-center gap-1">
                <Users size={12} weight="bold" />
                {event.attendees}
              </span>
            )}
          </div>

          {/* CTA arrow */}
          <motion.span
            className="w-9 h-9 rounded-full bg-rn-ink text-rn-base flex items-center justify-center flex-shrink-0"
            whileHover={{ rotate: 45 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ArrowUpRight size={14} weight="bold" />
          </motion.span>
        </footer>

        {/* Distance/pace badge — bottom-left of card */}
        {(event.distance || event.pace) && (
          <div className="absolute bottom-7 left-7 pointer-events-none z-0 opacity-50">
            <div className="font-display font-bold text-rn-ink/10 leading-none" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
              {event.distance || event.pace?.split(' ')[0]}
            </div>
          </div>
        )}
      </motion.a>
    </motion.div>
  )
}
