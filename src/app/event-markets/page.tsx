import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { EventMarketFeaturedCard } from '@/components/sections/EventMarketFeaturedCard'
import EventGrid from '@/components/sections/EventGrid'
import MarketHeatmap from '@/components/sections/MarketHeatmap'

export default function EventMarketsPage() {
  return (
    <div className="min-h-screen bg-hypiq-platinum text-hypiq-black">
      <Navigation />
      <main>
        {/* Featured Event Market */}
        <section className="py-10 md:py-12 bg-hypiq-platinum">
          <div className="container mx-auto px-4">
            <EventMarketFeaturedCard theme="light" />
          </div>
        </section>

        {/* Market Heatmap */}
        <MarketHeatmap />
        
        {/* Event Markets Grid */}
        <EventGrid />
        
      </main>
      <Footer />
    </div>
  )
}
