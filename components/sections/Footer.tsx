'use client'

import { Lightning, GithubLogo } from '@phosphor-icons/react'

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-10 border-t border-rn-line">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Massive editorial mark */}
        <div className="mb-16 overflow-hidden">
          <h2
            className="font-display font-bold text-rn-ink tracking-[-0.04em] leading-[0.85] select-none"
            style={{ fontSize: 'clamp(4rem, 18vw, 18rem)' }}
          >
            Run. <span className="italic text-coral">Run.</span> Run.
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-rn-ink flex items-center justify-center text-rn-base">
              <Lightning size={13} weight="fill" />
            </span>
            <span className="font-display font-semibold text-rn-ink text-sm">
              Running News
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-rn-muted tracking-wide">
            <span>© {new Date().getFullYear()} Running News</span>
            <span className="hidden md:inline w-px h-3 bg-rn-line" />
            <span>Built with Next.js · Framer Motion</span>
            <span className="hidden md:inline w-px h-3 bg-rn-line" />
            <a
              href="https://github.com/SalomonFranco/running-news"
              target="_blank"
              rel="noopener noreferrer"
              className="kinetic-link inline-flex items-center gap-1.5"
              style={{ transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rn-ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            >
              <GithubLogo size={12} weight="bold" />
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
