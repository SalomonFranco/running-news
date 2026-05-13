'use client'

import { motion } from 'framer-motion'

/**
 * Editorial about block — sets the magazine tone.
 * Big serif-style display headline (Unbounded handles this with italics),
 * narrow lead paragraph, signature.
 */
export default function About() {
  return (
    <section id="about" className="relative py-24 lg:py-36">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-[0.22em] text-rn-muted font-medium">
                About
              </span>
              <div className="w-10 h-px bg-rn-line" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-rn-faint mb-3">
              Issue · 01
            </p>
            <p className="text-rn-muted text-sm">
              Curated weekly · Updated daily via API
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <h2
              className="font-display font-semibold text-rn-ink tracking-[-0.02em] leading-[1.05] mb-10"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)' }}
            >
              Built by runners,{' '}
              <span className="italic text-rn-muted">
                for the ones still lacing up.
              </span>
            </h2>

            <p className="text-rn-muted leading-[1.75] max-w-[60ch] mb-6 text-[1.05rem]">
              Running News is a weekly agenda that pulls real events from
              real clubs. No fluff. No paywall. Just the next run, where it
              starts, and who's leading it.
            </p>

            <p className="text-rn-muted leading-[1.75] max-w-[60ch] mb-12 text-[1.05rem]">
              The API surface is open to plug into{' '}
              <span className="text-rn-ink font-medium">Strava Clubs</span>,{' '}
              <span className="text-rn-ink font-medium">Eventbrite</span>, and{' '}
              <span className="text-rn-ink font-medium">RunSignup</span>. Mock
              data ships today; live data ships when OAuth credentials get
              wired in.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-coral flex items-center justify-center">
                <span className="font-display font-bold text-rn-ink text-sm">
                  SF
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-rn-ink">Salomon Franco</div>
                <div className="text-rn-muted text-xs tracking-wide">
                  Editor & runner · Barcelona
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
