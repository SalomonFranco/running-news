import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-unbounded)', 'sans-serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      colors: {
        /* Sophisticated pastels — anti-saccharine. Warm cream base. */
        rn: {
          base:      '#FAF7F2',  // warm cream background
          surface:   '#FFFFFF',  // elevated white
          ink:       '#0E0E14',  // near-black with hint of blue
          smoke:     '#1E1E26',  // dark surface for contrast blocks
          muted:     '#73707A',  // body text muted
          faint:     '#B5B0B3',  // captions / borders
          line:      'rgba(14,14,20,0.08)',
        },
        coral:     '#FF8B7A',  // pastel coral — primary accent
        mint:      '#A8DBC5',  // pastel mint
        lavender:  '#C9B8F1',  // pastel lavender
        butter:    '#FFE07A',  // pastel butter
        peach:     '#FFD2A8',  // pastel peach
      },
      animation: {
        'marquee':       'marquee 38s linear infinite',
        'marquee-rev':   'marquee-rev 42s linear infinite',
        'spin-slow':     'spin 18s linear infinite',
        'pulse-dot':     'pulse-dot 2s ease-in-out infinite',
        'shimmer':       'shimmer 2.8s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-rev': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
