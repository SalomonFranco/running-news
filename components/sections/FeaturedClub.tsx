'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Trophy, Users, MapPin } from '@phosphor-icons/react'

/**
 * Editorial spotlight card — magazine-style hero block.
 * Inspired by Cereal Magazine layouts × Active Theory case studies.
 */
export default function FeaturedClub() {
  return (
    <section id="clubs" className="relative py-24 lg:py-36 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-12"
        >
          <span className="text-xs uppercase tracking-[0.22em] text-rn-muted font-medium">
            Club of the week
          </span>
          <div className="w-12 h-px bg-rn-line" />
        </motion.header>

        <motion.article
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden grain"
          style={{ background: 'var(--rn-ink)' }}
        >
          {/* Decorative gradient blob */}
          <div
            aria-hidden
            className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, var(--coral) 0%, transparent 70%)',
              filter: 'blur(80px)',
              opacity: 0.4,
            }}
          />
          <div
            aria-hidden
            className="absolute -left-40 -bottom-40 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, var(--lavender) 0%, transparent 70%)',
              filter: 'blur(80px)',
              opacity: 0.5,
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 p-10 lg:p-16">
            {/* Left — editorial */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={14} weight="fill" className="text-butter" />
                <span className="text-xs tracking-[0.22em] uppercase font-medium text-butter">
                  Featured
                </span>
              </div>

              <h3
                className="font-display font-bold text-rn-base tracking-[-0.025em] leading-[0.95] mb-6"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
              >
                Midnight
                <br />
                <span className="italic text-coral">Runners.</span>
              </h3>

              <p className="text-rn-base/70 leading-[1.6] mb-8 max-w-[52ch]">
                The boombox running crew that turned a Tuesday night into a
                global movement. Their Barcelona chapter meets weekly for
                bodyweight intervals, music, and zero ego.
              </p>

              <a
                href="https://www.midnightrunners.com/barcelona"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-coral px-6 py-3 text-sm tracking-wide"
              >
                Visit the club
                <ArrowUpRight size={14} weight="bold" data-arrow data-arrow-up />
              </a>
            </div>

            {/* Right — stats column */}
            <div className="flex flex-col gap-4">
              {[
                { icon: Users,  k: '28',   label: 'Avg attendees per session' },
                { icon: MapPin, k: '12',   label: 'Active cities worldwide' },
                { icon: Trophy, k: '2014', label: 'Founded — NYC origins' },
              ].map(({ icon: Icon, k, label }) => (
                <div
                  key={label}
                  className="flex items-end justify-between gap-4 py-6 border-b border-white/10 last:border-b-0"
                >
                  <div>
                    <Icon size={16} weight="bold" className="text-coral mb-3" />
                    <div className="text-xs uppercase tracking-[0.18em] text-rn-base/50 leading-tight max-w-[180px]">
                      {label}
                    </div>
                  </div>
                  <div
                    className="font-display font-bold text-rn-base tabular-nums leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 4vw, 3.75rem)' }}
                  >
                    {k}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
