'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Thin coral progress bar at the very top of the page.
 * Uses useSpring for buttery, physics-based follow.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] bg-coral"
      aria-hidden="true"
    />
  )
}
