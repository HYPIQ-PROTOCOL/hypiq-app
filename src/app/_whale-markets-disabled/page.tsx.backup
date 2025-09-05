import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { WhaleMarketFeaturedCard } from '@/components/sections/WhaleMarketFeaturedCard'
import { StatsSection } from '@/components/sections/StatsSection'
import WhaleMarketHeatmap from '@/components/sections/WhaleMarketHeatmap'
import WhaleMarketGrid from '@/components/sections/WhaleMarketGrid'

export default function WhaleMarketsPage() {
  return (
    <div className="min-h-screen bg-[#0e241f] text-white brightness-110 contrast-110">
      <Navigation />
      <main>
        <section className="py-10 md:py-12 bg-[#0e241f]">
          <div className="container mx-auto px-4">
            <WhaleMarketFeaturedCard />
          </div>
        </section>
        <WhaleMarketHeatmap />
        <WhaleMarketGrid />
      </main>
      <Footer />
    </div>
  )
}
