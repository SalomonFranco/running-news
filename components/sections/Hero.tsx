'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, MapPin, Calendar } from '@phosphor-icons/react'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.6 },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

const lineReveal = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: (i: number) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.12 },
  }),
}

/**
 * Editorial hero — massive display type, asymmetric, parallax decorative blobs.
 * Inspired by sports-magazine cover layouts (Eliud Kipchoge NN Running covers,
 * The Trail Magazine), brought into pastel-cyberpunk territory.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Parallax decorative blobs
  const blob1Y = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const blob2Y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] w-full overflow-hidden grain"
    >
      {/* Decorative pastel blobs — parallax */}
      <motion.div
        style={{ y: blob1Y }}
        className="absolute -top-40 -right-32 w-[640px] h-[640px] rounded-full pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, var(--coral) 0%, transparent 70%)',
            filter: 'blur(40px)',
            opacity: 0.55,
          }}
        />
      </motion.div>
      <motion.div
        style={{ y: blob2Y }}
        className="absolute top-1/2 -left-40 w-[520px] h-[520px] rounded-full pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle at 70% 30%, var(--lavender) 0%, transparent 70%)',
            filter: 'blur(60px)',
            opacity: 0.6,
          }}
        />
      </motion.div>
      <motion.div
        style={{ y: blob2Y }}
        className="absolute bottom-0 right-1/4 w-[380px] h-[380px] rounded-full pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--mint) 0%, transparent 65%)',
            filter: 'blur(50px)',
            opacity: 0.55,
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center pt-32 pb-20"
      >
        <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.div
              variants={item}
              className="flex items-center gap-4 mb-10"
            >
              <span className="flex items-center gap-2 text-xs tracking-[0.22em] uppercase font-medium text-rn-ink">
                <Calendar size={14} weight="bold" />
                Week of{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <div className="w-12 h-px bg-rn-ink" />
              <span className="flex items-center gap-2 text-xs tracking-[0.22em] uppercase font-medium text-rn-muted">
                <MapPin size={14} weight="bold" />
                Barcelona
              </span>
            </motion.div>

            {/* Display title — clip-path line reveals */}
            <h1
              className="font-display font-bold tracking-[-0.03em] text-rn-ink leading-[0.86] mb-8"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 11rem)' }}
            >
              <div className="overflow-hidden">
                <motion.div custom={0} variants={lineReveal}>
                  Running
                </motion.div>
              </div>
              <div className="overflow-hidden">
                <motion.div
                  custom={1}
                  variants={lineReveal}
                  className="text-coral italic font-display"
                >
                  News.
                </motion.div>
              </div>
            </h1>

            {/* Description */}
            <motion.p
              variants={item}
              className="text-rn-muted text-lg lg:text-xl max-w-[52ch] leading-[1.55] mb-12"
            >
              The weekly agenda of every running event in your city.{' '}
              <span className="text-rn-ink font-medium">Live, curated, free.</span>{' '}
              Find your next run, your next club, your next finish line.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <a
                href="#agenda"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-rn-ink text-rn-base text-sm font-medium tracking-wide"
                style={{
                  transition:
                    'background-color 0.2s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--coral)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                See this week's agenda
                <ArrowDown
                  size={14}
                  weight="bold"
                  style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  className="group-hover:translate-y-0.5"
                />
              </a>

              <a
                href="#clubs"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-rn-ink/15 text-rn-ink text-sm font-medium tracking-wide bg-white/60 backdrop-blur"
                style={{
                  transition:
                    'border-color 0.2s ease, background-color 0.2s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--rn-ink)'
                  e.currentTarget.style.background = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.background = ''
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Browse clubs
              </a>
            </motion.div>

            {/* Stat row */}
            <motion.div
              variants={item}
              className="mt-20 grid grid-cols-3 max-w-[560px] gap-8"
            >
              {[
                { n: '7',    label: 'days curated' },
                { n: '12+',  label: 'active clubs' },
                { n: '1.4k', label: 'runners this week' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display font-semibold text-rn-ink text-3xl lg:text-4xl tabular-nums">
                    {s.n}
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-rn-muted mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-rn-muted">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        >
          <ArrowDown size={14} weight="bold" className="text-rn-ink" />
        </motion.div>
      </motion.div>
    </section>
  )
}
