import type { Metadata } from 'next'
import { Unbounded, Manrope } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Running News — Weekly agenda of running events',
  description:
    'Live, curated agenda of running club events. Find your next run, your next club, your next finish line. Updated weekly.',
  openGraph: {
    title: 'Running News',
    description: 'Weekly agenda of running club events — live and curated.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${unbounded.variable} ${manrope.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
