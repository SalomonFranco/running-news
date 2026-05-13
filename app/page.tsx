import { getWeeklyAgenda } from '@/lib/mockEvents'

import ScrollProgress from '@/components/ui/ScrollProgress'
import BlobCursor from '@/components/ui/BlobCursor'
import LiveTicker from '@/components/ui/LiveTicker'
import Navigation from '@/components/Navigation'

import Hero from '@/components/sections/Hero'
import Marquee from '@/components/ui/Marquee'
import Agenda from '@/components/sections/Agenda'
import FeaturedClub from '@/components/sections/FeaturedClub'
import About from '@/components/sections/About'
import Footer from '@/components/sections/Footer'

/**
 * Server component — pre-fetches the weekly agenda for the live ticker
 * so the first paint already has a countdown. Agenda section re-fetches
 * client-side so revalidation works.
 */
export default function Home() {
  const agenda = getWeeklyAgenda()

  return (
    <main className="relative">
      {/* Global ornaments */}
      <ScrollProgress />
      <BlobCursor />
      <LiveTicker events={agenda.events} />
      <Navigation />

      {/* Page sections */}
      <Hero />
      <Marquee />
      <Agenda />
      <FeaturedClub />
      <About />
      <Footer />
    </main>
  )
}
