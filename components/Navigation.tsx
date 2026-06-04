'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
          <Image
            src="/logo.png"
            alt="Running News logo"
            width={28}
            height={28}
            style={{ transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(15deg)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
          />
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
              className="text-sm font-medium tracking-wide text-rn-muted kinetic-link transition-colors duration-150 hover:text-rn-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#agenda"
          className="btn btn-primary px-4 py-2 text-[13px] tracking-wide"
        >
          See this week
        </a>
      </div>
    </motion.nav>
  )
}
