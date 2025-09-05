'use client'

import { useMemo, useState, useEffect } from 'react'
import { WhaleMarketCard } from './WhaleMarketCard'
import { whaleMarkets as dataWhaleMarkets } from '@/data/markets'
import { getLogoKeyFromTitle, type EventMarket } from '@/lib/whale-utils'

// Use real data from data/markets
const mockEvents: EventMarket[] = dataWhaleMarkets as unknown as EventMarket[]

export default function WhaleMarketGrid() {
  const events: EventMarket[] = mockEvents

  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Avoid hydration mismatch by reading query on client after mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get('category') || 'all'
    setActiveCategory(c)
  }, [])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return events
    if (activeCategory === 'options') return events // placeholder; future: show options-only when we add that tag
    return events.filter((e) => getLogoKeyFromTitle(e.title) === activeCategory)
  }, [activeCategory, events])

  // Only these three markets are currently active; others are frosted "SOON"
  const ACTIVE_IDS = useMemo(() => new Set(['w1', 'w2', 'w3']), [])

  return (
    <section className="py-8 bg-gray-50">
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-[#0e241f] rounded-full"></div>
            <span className="text-sm font-bold tracking-[2px] text-gray-900 uppercase">WHALE MARKETS</span>
            <div className="w-2 h-2 bg-[#0e241f] rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 bg-gray-50">
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg">No bets available for this category</div>
          <div className="text-gray-500 text-sm mt-2">Try selecting a different category</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-0">
          {filtered.map((m) => {
            const isActive = ACTIVE_IDS.has(m.id)
            return (
              <WhaleMarketCard key={m.id} market={m} isActive={isActive} />
            )
          })}
        </div>
      )}
      </div>
    </section>
  )
}


