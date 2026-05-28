'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Custom cursor blob that follows the pointer with spring physics.
 * Grows over interactive elements (anchors, buttons, [data-cursor]).
 *
 * Per Apple WWDC "Fluid Interfaces": one-to-one tracking with spring
 * physics for amplified momentum. Disabled on touch devices.
 */
export default function BlobCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const scale = useMotionValue(1)

  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 })
  const ss = useSpring(scale, { stiffness: 280, damping: 22 })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Disable on touch devices and when the user prefers reduced motion
    if (window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor="hover"]')) {
        scale.set(2.4)
      } else {
        scale.set(1)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [x, y, scale])

  return (
    <motion.div
      ref={ref}
      style={{
        x: sx,
        y: sy,
        scale: ss,
        translateX: '-50%',
        translateY: '-50%',
      }}
      className="hidden md:block fixed top-0 left-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{
          background: 'var(--coral)',
          mixBlendMode: 'multiply',
          boxShadow: '0 0 20px rgba(255,139,122,0.55)',
        }}
      />
    </motion.div>
  )
}
