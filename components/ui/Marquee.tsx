'use client'

import { Asterisk } from '@phosphor-icons/react'

const ITEMS = [
  'Barcelona',
  'Madrid',
  'Lisbon',
  'Paris',
  'Berlin',
  'London',
  'Amsterdam',
  'Stockholm',
  'Copenhagen',
  'Rome',
]

const TRACK = [...ITEMS, ...ITEMS]

/**
 * Editorial marquee — large kinetic typography of city names.
 * Style ref: Locomotive Scroll showcases & Pangram's font display pages.
 */
export default function Marquee() {
  return (
    <section
      className="relative overflow-hidden py-10 lg:py-14 border-y border-rn-line"
      style={{ background: 'var(--rn-ink)' }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
        {TRACK.map((city, i) => (
          <div
            key={i}
            className="flex items-center gap-12 flex-shrink-0"
          >
            <span
              className="font-display font-semibold text-rn-base tracking-tight"
              style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}
            >
              {city}
            </span>
            <Asterisk
              size={28}
              weight="bold"
              className="text-coral animate-spin-slow flex-shrink-0"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
