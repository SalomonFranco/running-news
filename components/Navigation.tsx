'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightning } from '@phosphor-icons/react'

const LINKS = [
  { label: 'Agenda',  href: '#agenda' },
  { label: 'Clubs',   href: '#clubs' },
  { label: 'About',   href: '#about' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-16 left-0 right-0 z-40 ${
        scrolled
          ? 'bg-rn-base/70 backdrop-blur-lg border-b border-rn-line'
          : 'bg-transparent'
      }`}
      style={{ transition: 'background-color 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          aria-label="Running News home"
        >
          <span
            className="w-7 h-7 rounded-full bg-rn-ink flex items-center justify-center text-rn-base"
            style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(15deg)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
          >
            <Lightning size={14} weight="fill" />
          </span>
          <span className="font-display font-semibold tracking-tight text-rn-ink text-[15px]">
            Running News
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium tracking-wide text-rn-muted kinetic-link"
              style={{ transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rn-ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#agenda"
          className="px-4 py-2 rounded-full bg-rn-ink text-rn-base text-[13px] font-medium tracking-wide"
          style={{
            transition: 'background-color 0.2s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--coral)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          See this week
        </a>
      </div>
    </motion.nav>
  )
}
