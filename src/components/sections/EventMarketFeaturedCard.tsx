'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { OddsProgressBar } from '@/components/shared/OddsProgressBar'
import { MarketChart } from '@/components/shared/MarketChart'

// Event market data type
type EventMarket = {
  id: string
  title: string
  description: string
  category: string
  options: {
    name: string
    percent: number
  }[]
  volume: number
  imageUrl?: string
}

// Mock event markets data for featured section
const featuredEvents: EventMarket[] = [
  {
    id: '1',
    title: 'Will ETH be above $4k by year end?',
    description: 'Major price prediction for Ethereum as institutional adoption grows',
    category: 'CRYPTO',
    options: [
      { name: 'Yes', percent: 37 },
      { name: 'No', percent: 63 }
    ],
    volume: 5300000,
    imageUrl: 'https://picsum.photos/seed/eth/96/96',
  },
  {
    id: '2',
    title: 'Will Bitcoin reach $150k before 2026?',
    description: 'Long-term BTC price target based on halving cycles and adoption',
    category: 'CRYPTO',
    options: [
      { name: 'Yes', percent: 48 },
      { name: 'No', percent: 52 }
    ],
    volume: 254539,
    imageUrl: 'https://picsum.photos/seed/btc/96/96',
  },
  {
    id: '3',
    title: 'Next US Presidential Election Winner?',
    description: 'Political prediction market for the upcoming presidential election',
    category: 'POLITICS',
    options: [
      { name: 'J.D. Vance', percent: 27 },
      { name: 'Gavin Newsom', percent: 13 }
    ],
    volume: 1262355,
    imageUrl: 'https://picsum.photos/seed/politics/96/96',
  }
]

interface EventMarketFeaturedCardProps {
  theme?: 'light' | 'dark'
  showNavigation?: boolean
}

export function EventMarketFeaturedCard({ theme = 'dark', showNavigation = true }: EventMarketFeaturedCardProps = {}) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState<'next' | 'prev' | null>(null)
  const currentEvent = featuredEvents[currentEventIndex]
  const isDark = theme === 'dark'

  const handlePrevious = () => {
    if (!showNavigation) return
    setIsAnimating('prev')
    setTimeout(() => {
      setCurrentEventIndex((prev) => prev === 0 ? featuredEvents.length - 1 : prev - 1)
      setIsAnimating(null)
    }, 200)
  }

  const handleNext = () => {
    if (!showNavigation) return
    setIsAnimating('next')
    setTimeout(() => {
      setCurrentEventIndex((prev) => prev === featuredEvents.length - 1 ? 0 : prev + 1)
      setIsAnimating(null)
    }, 200)
  }

  const generateChartData = useMemo(() => {
    return () => {
      // Deterministic PRNG to avoid hydration mismatches between SSR and client
      const prng = (() => {
        let seed = 0x9e3779b1 >>> 0
        return () => {
          // xorshift32
          seed ^= seed << 13
          seed ^= seed >>> 17
          seed ^= seed << 5
          // map to [0,1)
          return ((seed >>> 0) % 1_000_000) / 1_000_000
        }
      })()

      const hours = ['3:26am', '4:58am', '6:31am', '8:04am', '2:36pm']
      const yesTarget = currentEvent.options[0]?.percent || 50
      const noTarget = currentEvent.options[1]?.percent || 50
      
      return Array.from({ length: 50 }, (_, i) => {
        const timeProgress = i / 50
        const convergence = Math.pow(timeProgress, 1.5) // Stronger convergence toward end
        
        // Start with some variation and converge to actual percentages
        const startVariationYes = yesTarget + (prng() - 0.5) * 20
        const startVariationNo = noTarget + (prng() - 0.5) * 20
        
        // Add some realistic market movement
        const marketMovementYes = Math.sin(timeProgress * Math.PI * 3) * 8 * (1 - convergence)
        const marketMovementNo = Math.cos(timeProgress * Math.PI * 2.5) * 8 * (1 - convergence)
        
        // Noise decreases over time to show convergence
        const noiseYes = (prng() - 0.5) * 6 * (1 - convergence * 0.8)
        const noiseNo = (prng() - 0.5) * 6 * (1 - convergence * 0.8)
        
        // Interpolate between start variation and actual percentage
        const yesValue = startVariationYes * (1 - convergence) + yesTarget * convergence + marketMovementYes + noiseYes
        const noValue = startVariationNo * (1 - convergence) + noTarget * convergence + marketMovementNo + noiseNo
        
        return {
          time: hours[Math.floor(i / 10)] || `${i}h`,
          yes: Math.max(5, Math.min(95, yesValue)),
          no: Math.max(5, Math.min(95, noValue)),
        }
      })
    }
  }, [currentEvent])

  const chartConfig = {
    yes: {
      label: currentEvent.options[0]?.name || "Yes",
      color: "#34d399",
    },
    no: {
      label: currentEvent.options[1]?.name || "No", 
      color: "#ef4444",
    },
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`
    }
    return `$${volume}`
  }

  return (
    <div className="relative">
      {/* Outer navigation arrows */}
      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={`absolute -left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg z-10 h-9 w-9 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm'
                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
            }`}
            aria-label="Previous"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`absolute -right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg z-10 h-9 w-9 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm'
                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
            }`}
            aria-label="Next"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <Card className={`relative overflow-hidden rounded-xl p-4 md:p-6 w-full transition-transform duration-200 ease-out ${
        isDark 
          ? 'bg-white/10 border border-white/20 text-white shadow-lg hover:shadow-2xl'
          : 'bg-hypiq-white border border-hypiq-anti-flash text-hypiq-black shadow-lg hover:shadow-xl hover:border-hypiq-platinum'
      } ${isAnimating === 'next' ? 'translate-x-4 opacity-90' : ''} ${isAnimating === 'prev' ? '-translate-x-4 opacity-90' : ''}`}>
        
      <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        {/* Left block - event market info */}
        <div className="relative md:w-[48%] overflow-hidden rounded-lg">
          
          {/* Content overlay */}
          <div className="relative p-4 z-10">
            {/* Header: Category + Volume */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isDark 
                  ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {currentEvent.category}
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {formatVolume(currentEvent.volume)}
              </span>
            </div>

            {/* Market image and title */}
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-md overflow-hidden shrink-0 flex items-center justify-center ${
                isDark ? 'border border-white/15 bg-white/10' : 'border border-hypiq-anti-flash bg-hypiq-white'
              }`}>
                <Image 
                  src={currentEvent.imageUrl || 'https://picsum.photos/seed/placeholder/96/96'} 
                  alt={currentEvent.title} 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 md:w-12 md:h-12 object-cover rounded" 
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <h1 className={`featured-title text-lg md:text-2xl font-black leading-tight tracking-tight ${
                isDark ? 'text-white' : 'text-hypiq-black'
              }`}>
                {currentEvent.title}
              </h1>
            </div>

            {/* Event Options */}
            <div className="space-y-3 mb-4">
              {currentEvent.options.map((option, index) => (
                <OddsProgressBar
                  key={option.name}
                  label={option.name}
                  percentage={option.percent}
                  isProfit={index === 0}
                  theme={theme}
                />
              ))}
            </div>

            {/* Bottom meta */}
            <div className={`pt-3 border-t ${isDark ? 'border-white/10' : 'border-hypiq-anti-flash'}`}>
              <p className={`text-xs mb-2 leading-relaxed ${isDark ? 'text-white/70' : 'text-hypiq-black/70'}`}>
                {currentEvent.description}
              </p>
              <div className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-white/50' : 'text-hypiq-black/50'}`}>
                VOLUME {formatVolume(currentEvent.volume)} • LIVE MARKET
              </div>
            </div>
          </div>
        </div>

        {/* Vertical divider between columns */}
          <div className={`hidden md:flex w-px self-stretch bg-gradient-to-b from-transparent to-transparent ${
            isDark ? 'via-white/30' : 'via-hypiq-black/30'
          }`} />

        {/* Right block - options + chart */}
        <div className="md:w-[52%] flex flex-col justify-center">
          {/* Legend centered above the chart with same width as chart */}
          <div className={`mx-auto max-w-[420px] flex items-center justify-center gap-4 md:gap-6 mb-2 md:mb-3 text-[11px] md:text-xs ${
            isDark ? 'text-white/80' : 'text-hypiq-black/70'
          }`}>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>{currentEvent.options[0]?.name} ({currentEvent.options[0]?.percent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span>{currentEvent.options[1]?.name} ({currentEvent.options[1]?.percent}%)</span>
            </div>
          </div>
          {/* Options moved to left; keep spacing before divider */}
          <div className="mb-3" />
           {/* Centered half-length divider (hidden on mobile to reduce clutter) */}
           <div className="hidden md:flex justify-center mb-3">
            <div className={`h-px w-1/2 bg-gradient-to-r from-transparent to-transparent ${
              isDark ? 'via-white/30' : 'via-hypiq-black/30'
            }`}></div>
          </div>
          
           {/* Chart container */}
           <MarketChart
             config={chartConfig}
             theme={theme}
             generateData={generateChartData}
           />
        </div>
      </div>

      {/* Carousel controls */}
      {/* removed inner pagination controls; handled by outer arrows */}
    </Card>
    </div>
  )
}
