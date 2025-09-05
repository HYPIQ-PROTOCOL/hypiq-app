'use client'

import { useMemo } from 'react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis } from 'recharts'

interface ChartDataPoint {
  time: string
  [key: string]: string | number
}

interface MarketChartProps {
  data?: ChartDataPoint[]
  config: Record<string, { label: string; color: string }>
  theme?: 'light' | 'dark'
  height?: string
  generateData?: () => ChartDataPoint[]
}

// Default deterministic PRNG for consistent data
const createPRNG = (seed: number = 0x9e3779b1) => {
  let state = seed >>> 0
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) % 1_000_000) / 1_000_000
  }
}

export function MarketChart({ 
  data, 
  config, 
  theme = 'light', 
  height = "h-32 md:h-36",
  generateData 
}: MarketChartProps) {
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    if (data) return data
    if (generateData) return generateData()
    
    // Default data generation
    const prng = createPRNG()
    const hours = ['3:26am', '4:58am', '6:31am', '8:04am', '2:36pm']
    const keys = Object.keys(config)
    
    return Array.from({ length: 50 }, (_, i) => {
      const result: ChartDataPoint = {
        time: hours[Math.floor(i / 10)] || `${i}h`
      }
      
      keys.forEach(key => {
        const noise = prng() * 10 - 5
        const baseValue = 50 + Math.sin(i / 8) * 20 + noise
        result[key] = Math.max(5, Math.min(95, baseValue))
      })
      
      return result
    })
  }, [data, generateData, config])

  const chartTicks = ['3:26am', '4:58am', '6:31am', '8:04am', '2:36pm']
  const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(75,85,99,0.8)'

  return (
    <div className={height}>
      <ChartContainer config={config} className="h-full w-full mx-auto max-w-[420px]">
        <LineChart data={chartData} margin={{ top: 6, right: 32, left: 32, bottom: 16 }}>
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: textColor }}
            tickMargin={10}
            allowDuplicatedCategory={false}
            ticks={chartTicks}
            interval={0}
          />
          <YAxis 
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: textColor }}
            width={32}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip 
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              
              return (
                <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-2 shadow-md">
                  <div className="space-y-1">
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">
                          {Math.round(entry.value as number)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          />
          {Object.keys(config).map((dataKey) => (
            <Line
              key={dataKey}
              type="monotone"
              dataKey={dataKey}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2}
              dot={false}
              strokeDasharray="0"
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

