'use client'

import { MotionConfig } from 'framer-motion'

/**
 * Site-wide motion settings. `reducedMotion="user"` makes every Framer Motion
 * animation honour `prefers-reduced-motion` automatically — transform/layout
 * animations resolve instantly while opacity fades remain, so the page stays
 * legible and calm for users who opt out of motion.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
