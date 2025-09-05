import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { WhaleMarketFeaturedCard } from '@/components/sections/WhaleMarketFeaturedCard'
import WhaleMarketHeatmap from '@/components/sections/WhaleMarketHeatmap'
import WhaleMarketGrid from '@/components/sections/WhaleMarketGrid'

export default function WhaleMarketsPage() {
  return (
    <div className="min-h-screen bg-[#0e241f] text-white brightness-110 contrast-110">
      <Navigation />
      <main>
        {/* Whale Markets Hero */}
        <section className="py-16 md:py-24 bg-[#0e241f]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-green-400">Whale Markets</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Track and bet on whale trading positions. Monitor large wallet movements, 
              position profitability, and liquidation risks in real-time.
            </p>
          </div>
        </section>

        {/* Featured Whale Market */}
        <section className="py-10 md:py-12 bg-[#0e241f]">
          <div className="container mx-auto px-4">
            <WhaleMarketFeaturedCard />
          </div>
        </section>
        
        {/* Whale Market Heatmap */}
        <WhaleMarketHeatmap />
        
        {/* Whale Markets Grid */}
        <WhaleMarketGrid />
        
      </main>
      <Footer />
    </div>
  )
}
