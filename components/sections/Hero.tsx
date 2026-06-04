'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, MapPin, Calendar } from '@phosphor-icons/react'
import { GooeyText } from '@/components/ui/gooey-text-morphing'
import { MagicTextLines } from '@/components/ui/magic-text'

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
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' → '}
                {new Date(Date.now() + 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="w-12 h-px bg-rn-ink" />
              <span className="flex items-center gap-2 text-xs tracking-[0.22em] uppercase font-medium text-rn-muted">
                <MapPin size={14} weight="bold" />
                Barcelona
              </span>
            </motion.div>

            {/* Gooey morphing headline */}
            <GooeyText
              texts={['Social', 'Running', 'Is', 'Cool']}
              morphTime={1}
              cooldownTime={0.25}
              className="w-full h-[160px] mt-[189px]"
              textClassName="font-display font-bold tracking-[-0.03em] text-rn-ink [font-size:clamp(3.5rem,12vw,11rem)]"
            />

            {/* Stats row */}
            <motion.div
              variants={item}
              className="flex items-start justify-center gap-8 sm:gap-16 lg:gap-24 pt-16"
            >
              {[
                { value: '7',    label: 'Days Curated' },
                { value: '12+',  label: 'Active Clubs' },
                { value: '1.4k', label: 'Runners This Week' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <span
                    className="font-display font-bold text-rn-ink tabular-nums leading-none"
                    style={{ fontSize: 'clamp(1.5rem, 4vw, 4rem)' }}
                  >
                    {value}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.22em] font-medium text-rn-muted">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Scroll-reveal description */}
            <div className="flex justify-center pt-[96px]">
              <MagicTextLines
                lines={[
                  "The weekly agenda of every running event in your city.",
                  "Live, curated, free.",
                  "Find your next run, your next club, your next finish line.",
                ]}
                className="text-center max-w-[52ch]"
              />
            </div>
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
