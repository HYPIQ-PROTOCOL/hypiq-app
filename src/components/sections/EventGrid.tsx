'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type EventOption = {
  name: string
  percent: number
}

type EventMarket = {
  id: string
  title: string
  options: EventOption[]
  volume: number
  imageUrl?: string
}

const mockEvents: EventMarket[] = [
  {
    id: 'e1',
    title: 'Next US Presidential Election Winner?',
    options: [
      { name: 'J.D. Vance', percent: 27 },
      { name: 'Gavin Newsom', percent: 13 },
    ],
    volume: 1262355,
    imageUrl: 'https://picsum.photos/seed/e1/96/96',
  },
  {
    id: 'e2',
    title: 'New York City Mayor Election',
    options: [
      { name: 'Zohran Mamdani', percent: 80 },
      { name: 'Andrew Cuomo', percent: 10 },
    ],
    volume: 16901170,
    imageUrl: 'https://picsum.photos/seed/e2/96/96',
  },
  {
    id: 'e3',
    title: 'CPI in July 2025 above 0.2%?',
    options: [
      { name: 'Above 0.2%', percent: 54 },
      { name: 'Above 0.1%', percent: 89 },
    ],
    volume: 12551160,
    imageUrl: 'https://picsum.photos/seed/e3/96/96',
  },
  {
    id: 'e4',
    title: 'Will ETH be above $4k by year end?',
    options: [
      { name: 'Yes', percent: 37 },
      { name: 'No', percent: 63 },
    ],
    volume: 5300000,
    imageUrl: 'https://picsum.photos/seed/e4/96/96',
  },
  {
    id: 'e5',
    title: 'Trump, Putin, and Zelenskyy meet before year end?',
    options: [
      { name: 'Yes', percent: 8 },
      { name: 'No', percent: 92 },
    ],
    volume: 82503,
    imageUrl: 'https://picsum.photos/seed/e5/96/96',
  },
  {
    id: 'e6',
    title: 'Who will win the Nobel Peace Prize?',
    options: [
      { name: 'Yulia Navalnaya', percent: 19 },
      { name: 'Donald Trump', percent: 12 },
    ],
    volume: 2729187,
    imageUrl: 'https://picsum.photos/seed/e6/96/96',
  },
  {
    id: 'e7',
    title: 'Will Bitcoin reach $150k before 2026?',
    options: [
      { name: 'Yes', percent: 48 },
      { name: 'No', percent: 52 },
    ],
    volume: 254539,
    imageUrl: 'https://picsum.photos/seed/e7/96/96',
  },
  {
    id: 'e8',
    title: 'Fed funds rate in September?',
    options: [
      { name: 'Above 4.25%', percent: 17 },
      { name: 'Above 4.00%', percent: 94 },
    ],
    volume: 36642739,
    imageUrl: 'https://picsum.photos/seed/e8/96/96',
  },
  {
    id: 'e9',
    title: 'Will Taylor Swift and Travis Kelce be engaged this year?',
    options: [
      { name: 'Yes', percent: 51 },
      { name: 'No', percent: 45 },
    ],
    volume: 99877,
    imageUrl: 'https://picsum.photos/seed/e9/96/96',
  },
]

export function EventCard({ market, onAddToChain, cardIndex, tutorialStep, selectedOptions, onSelectionChange }: { 
  market: EventMarket; 
  onAddToChain?: (market: EventMarket, cardElement?: HTMLElement) => void; 
  cardIndex?: number; 
  tutorialStep?: number; 
  selectedOptions?: {[key: string]: 'yes' | 'no' | null}; 
  onSelectionChange?: (marketId: string, optionName: string, selection: 'yes' | 'no') => void; 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const getCategoryBadge = (id: string) => {
    switch (id) {
      case 'finance':
        return { label: 'Finance', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'sports':
        return { label: 'Sports', color: 'bg-green-100 text-green-800 border-green-200' }
      case 'crypto':
        return { label: 'Crypto', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      default:
        return { label: 'Market', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`
    }
    return `$${volume}`
  }

  const badge = getCategoryBadge(market.id)

  return (
    <Card ref={cardRef} className="bg-white border border-gray-200 rounded-2xl px-5 pt-5 pb-4 text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 w-full font-montserrat font-normal">
      {/* Header with badge and volume */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
          {badge.label}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {formatVolume(market.volume)}
        </span>
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

      <div className="flex items-center gap-2 md:gap-3 mb-6">
        <Image 
          src={market.imageUrl || 'https://picsum.photos/seed/placeholder/96/96'} 
          alt="event" 
          width={60} 
          height={60} 
          className="w-14 h-14 md:w-12 md:h-12 rounded-md object-cover border border-gray-200 flex-shrink-0" 
          style={{ width: 'auto', height: 'auto' }}
        />
        <h3 className="text-md md:text-md font-bold text-gray-900 leading-tight">{market.title}</h3>
      </div>

      <div className="space-y-4 mb-6">
        {market.options.map((opt, idx) => {
          const isPrimary = idx === 0
          return (
            <div key={opt.name} className="flex items-center gap-2">
              <span className="text-sm text-gray-700 w-24 shrink-0 truncate">{opt.name}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className={`h-full transition-all ${
                        isPrimary 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-red-500 to-rose-400'
                      }`}
                      style={{ width: `${opt.percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-10 text-right text-gray-900">{opt.percent}%</span>
                </div>
              </div>
              <div 
                className="flex items-center gap-1" 
                data-tutorial={
                  (tutorialStep === 1 && cardIndex === 0) || 
                  (tutorialStep === 4 && cardIndex === 1) || 
                  (tutorialStep === 7 && cardIndex === 2) 
                    ? "yes-no-buttons" : ""
                }
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectionChange?.(market.id, opt.name, 'yes');
                  }}
                  className={`h-6 px-2 text-xs rounded-full border transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 active:scale-95 ${
                    selectedOptions?.[opt.name] === 'yes' 
                      ? 'bg-emerald-200 border-emerald-400 text-emerald-800 font-semibold shadow-sm' 
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-700'
                  }`}
                >
                  Yes
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectionChange?.(market.id, opt.name, 'no');
                  }}
                  className={`h-6 px-2 text-xs rounded-full border transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0 active:scale-95 ${
                    selectedOptions?.[opt.name] === 'no' 
                      ? 'bg-red-200 border-red-400 text-red-800 font-semibold shadow-sm' 
                      : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-4" />

      {/* Add to Chain Button */}
      <div className="relative overflow-hidden rounded-b-2xl -mx-5 -mb-4 px-5 pb-0 pt-0">
        <div 
          className="relative flex justify-center items-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-200 py-2"
          onClick={() => onAddToChain?.(market, cardRef.current || undefined)}
        >
          <div 
            className="flex items-center gap-2" 
            data-tutorial={
              (tutorialStep === 2 || tutorialStep === 3) && cardIndex === 0 ? "add-to-chain-1" :
              (tutorialStep === 5 || tutorialStep === 6) && cardIndex === 1 ? "add-to-chain-2" :
              (tutorialStep === 8 || tutorialStep === 9) && cardIndex === 2 ? "add-to-chain-3" :
              ""
            }
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-black text-sm font-medium"
              style={{ backgroundColor: '#ECEFF2' }}
            >
              +
            </div>
            <span className="text-xs font-medium text-black">Add to chain</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function EventGrid() {
  const [events] = useState<EventMarket[]>(mockEvents)

  return (
    <section className="py-8 bg-hypiq-platinum">
      {/* Events Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((m) => (
            <EventCard key={m.id} market={m} />
          ))}
        </div>
      </div>
    </section>
  )
}


