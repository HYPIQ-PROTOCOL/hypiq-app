'use client'

import { useMemo } from 'react'
import { ChartContainer } from '@/components/ui/chart'
import { Marquee } from '@/components/ui/Marquee'
import { LineChart, Line, XAxis, YAxis } from 'recharts'

type HeatCategory = {
  key: string
  label: string
  emoji: string
  percentage: number
  colors: {
    bg: string
    text: string
    border: string
  }
}

// Updated categories with specific percentages, emojis, and color schemes
const CATEGORIES: HeatCategory[] = [
  { 
    key: 'economics', 
    label: 'Economics', 
    emoji: '📊', 
    percentage: 59,
    colors: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' }
  },
  { 
    key: 'sports', 
    label: 'Sports', 
    emoji: '⚽', 
    percentage: 50,
    colors: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
  },
  { 
    key: 'crypto', 
    label: 'Crypto', 
    emoji: '₿', 
    percentage: 55,
    colors: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' }
  },
  { 
    key: 'tech', 
    label: 'Tech', 
    emoji: '💻', 
    percentage: 55,
    colors: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }
  },
  { 
    key: 'health', 
    label: 'Health', 
    emoji: '🏥', 
    percentage: 30,
    colors: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  },
  { 
    key: 'science', 
    label: 'Science', 
    emoji: '🔬', 
    percentage: 64,
    colors: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' }
  },
  { 
    key: 'music', 
    label: 'Music', 
    emoji: '🎵', 
    percentage: 74,
    colors: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' }
  },
  { 
    key: 'esports', 
    label: 'Esports', 
    emoji: '🎮', 
    percentage: 69,
    colors: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' }
  },
]

// Using shadcn/Recharts white line for mini trend inside each tile

export default function MarketHeatmap() {
  const data = useMemo(() => {
    // Deterministic PRNG to avoid hydration mismatches
    const prng = (() => {
      let seed = 0x12345678 >>> 0
      return () => {
        seed ^= seed << 13
        seed ^= seed >>> 17
        seed ^= seed << 5
        return ((seed >>> 0) % 1_000_000) / 1_000_000
      }
    })()

    return CATEGORIES.map((c, idx) => {
      // Use the fixed percentage as the base for the trend line
      const base = c.percentage
      const values = Array.from({ length: 16 }, (_, i) => {
        // Create a subtle trend around the fixed percentage
        const trend = Math.sin(i / 2 + idx) * 8 + (prng() * 6 - 3)
        return Math.min(100, Math.max(0, base + trend))
      })
      const series = values.map((v, i) => ({ x: i, y: v }))
      // Always show the exact percentage specified
      return { 
        key: c.key, 
        label: c.label, 
        emoji: c.emoji,
        colors: c.colors,
        intensity: c.percentage, 
        series 
      }
    })
  }, [])

  return (
    <section className="bg-hypiq-platinum text-hypiq-black py-4">
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-3">
        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-hypiq-platinum rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-black">
            <span className="text-xs font-medium tracking-wide text-hypiq-black/70 uppercase">Volume Heatmap</span>
          </div>
        </div>
        {/* Cool horizontal line */}
        <div className="flex justify-center mt-4 mb-2">
          <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-hypiq-black/30 to-transparent"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-2 md:px-4">
        <Marquee className="py-1" pauseOnHover repeat={8}>
          {data.map((item) => {
            return (
              <button
                key={item.key}
                className={`relative h-16 w-[180px] overflow-hidden rounded-lg px-3 py-2 text-left transition hover:scale-105 hover:shadow-lg border ${item.colors.bg} ${item.colors.border} ${item.colors.text}`}
              >
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-[11px] font-medium tracking-wide truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold tabular-nums">{Math.round(item.intensity)}%</span>
                </div>
                <div className="relative mt-1 h-8">
                  <ChartContainer 
                    config={{ 
                      trend: { 
                        color: item.key === 'economics' ? '#1e40af' :
                               item.key === 'sports' ? '#15803d' :
                               item.key === 'crypto' ? '#ea580c' :
                               item.key === 'tech' ? '#7c3aed' :
                               item.key === 'health' ? '#dc2626' :
                               item.key === 'science' ? '#0891b2' :
                               item.key === 'music' ? '#db2777' :
                               item.key === 'esports' ? '#4338ca' : '#374151'
                      } 
                    }} 
                    className="h-full w-full"
                  >
                    <LineChart data={item.series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="x" hide domain={[0, 15]} />
                      <YAxis hide domain={[0, 100]} />
                      <Line 
                        type="monotone" 
                        dataKey="y" 
                        stroke={item.key === 'economics' ? '#1e40af' :
                               item.key === 'sports' ? '#15803d' :
                               item.key === 'crypto' ? '#ea580c' :
                               item.key === 'tech' ? '#7c3aed' :
                               item.key === 'health' ? '#dc2626' :
                               item.key === 'science' ? '#0891b2' :
                               item.key === 'music' ? '#db2777' :
                               item.key === 'esports' ? '#4338ca' : '#374151'}
                        strokeOpacity={0.9} 
                        strokeWidth={1.8} 
                        dot={false} 
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </button>
            )
          })}
        </Marquee>
      </div>
    </section>
  )
}


