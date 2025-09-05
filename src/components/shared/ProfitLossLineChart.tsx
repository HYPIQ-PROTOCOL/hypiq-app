"use client"

import { useMemo, useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { useHyperliquidPrice } from "@/hooks/useHyperliquidPrice"

interface ProfitLossLineChartProps {
  coinSymbol: string
  entryPrice: number
  positionType: 'LONG' | 'SHORT'
  theme?: 'light' | 'dark'
  compact?: boolean
}

export function ProfitLossLineChart({ 
  coinSymbol,
  entryPrice, 
  positionType,
  theme = 'light',
  compact = false
}: ProfitLossLineChartProps) {
  const isDark = theme === 'dark'
  const { priceData, isConnected } = useHyperliquidPrice(coinSymbol)
  const [isClient, setIsClient] = useState(false)
  const [fallbackPrice, setFallbackPrice] = useState<number | null>(null)
  
  // Handle hydration and client-side rendering
  useEffect(() => {
    setIsClient(true)
    // Generate consistent fallback price only on client
    setFallbackPrice(entryPrice * (1 + (Math.random() - 0.5) * 0.02))
  }, [entryPrice])
  
  // Determine current price with proper fallback
  const currentPrice = priceData?.price || fallbackPrice || entryPrice
  
  // Show loading state during hydration or while connecting
  const isLoading = !isClient || (!priceData && isConnected === false)
  
  // Generate mock historical data based on position evolution
  const chartData = useMemo(() => {
    if (!isClient) return [] // Prevent SSR hydration issues
    
    const dataPoints = 15
    const data = []
    
    // Create realistic price movement with some volatility
    const totalPriceChange = currentPrice - entryPrice
    const volatilityFactor = Math.abs(totalPriceChange / entryPrice) * 0.5 // Add some volatility
    
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1)
      
      // Add some realistic volatility to the price path
      const noise = (Math.sin(i * 0.8) + Math.cos(i * 1.2)) * volatilityFactor * entryPrice
      const basePrice = entryPrice + (totalPriceChange * progress)
      const simulatedPrice = basePrice + noise * (0.3 + 0.7 * Math.random())
      
      // Calculate profit probability based on position type and price movement
      const priceChangePercent = (simulatedPrice - entryPrice) / entryPrice
      
      let profitProbability = 0.5 // Start neutral
      
      if (positionType === 'LONG') {
        // For LONG: price goes up = more profit probability
        profitProbability = 0.5 + (priceChangePercent * 3) // Scale the effect
      } else {
        // For SHORT: price goes down = more profit probability  
        profitProbability = 0.5 - (priceChangePercent * 3) // Inverse for SHORT
      }
      
      // Clamp between 0.15 and 0.85 for better visual range
      profitProbability = Math.max(0.15, Math.min(0.85, profitProbability))
      
      data.push({
        time: i,
        profitProbability,
        price: simulatedPrice,
        priceChange: priceChangePercent
      })
    }
    
    return data
  }, [entryPrice, currentPrice, positionType, isClient])
  
  const chartConfig = {
    profitProbability: {
      label: "Profit Probability",
      color: isDark ? "#10b981" : "#059669", // emerald color
    },
  } satisfies ChartConfig

  // Loading skeleton component
  if (isLoading) {
    return (
      <div className={`${compact ? 'mt-3' : 'mt-4'} pt-3 border-t border-gray-200/20`}>
        <div className="flex items-center justify-between">
          {/* Left: Entry Price Skeleton */}
          <div className="flex flex-col">
            <div className={`${compact ? 'text-xs' : 'text-sm'} ${
              isDark ? 'text-white/60' : 'text-gray-500'
            }`}>
              Entry Price:
            </div>
            <div className={`${compact ? 'h-4 w-16' : 'h-5 w-20'} ${
              isDark ? 'bg-white/20' : 'bg-gray-300'
            } rounded animate-pulse`} />
          </div>

          {/* Center: Chart Skeleton */}
          <div className="flex-1 max-w-[120px] mx-4">
            <div className={`h-12 w-full ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            } rounded animate-pulse`} />
          </div>

          {/* Right: Current Price Skeleton */}
          <div className="flex flex-col text-right">
            <div className={`${compact ? 'text-xs' : 'text-sm'} ${
              isDark ? 'text-white/60' : 'text-gray-500'
            }`}>
              Current Price:
            </div>
            <div className={`${compact ? 'h-4 w-16' : 'h-5 w-20'} ${
              isDark ? 'bg-white/20' : 'bg-gray-300'
            } rounded animate-pulse ml-auto`} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'mt-3' : 'mt-4'} pt-3 border-t border-gray-200/20`}>
      <div className="flex items-center justify-between">
        {/* Left: Entry Price */}
        <div className="flex flex-col">
          <div className={`${compact ? 'text-xs' : 'text-sm'} ${
            isDark ? 'text-white/60' : 'text-gray-500'
          }`}>
            Entry Price:
          </div>
          <div className={`${compact ? 'text-sm' : 'text-base'} font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            ${entryPrice.toLocaleString()}
          </div>
        </div>

        {/* Center: Dual-Color Line Chart */}
        <div className="flex-1 max-w-[120px] mx-4">
          <ChartContainer
            config={chartConfig}
            className="h-12 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              >
                <XAxis 
                  dataKey="time" 
                  hide 
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  domain={[0.15, 0.85]} 
                  hide 
                  axisLine={false}
                  tickLine={false}
                />
                
                {/* Single line with gradient based on profit probability */}
                <Line
                  type="monotone"
                  dataKey="profitProbability"
                  stroke={chartData[chartData.length - 1]?.profitProbability > 0.5 ? "#10b981" : "#ef4444"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Right: Current Price */}
        <div className="flex flex-col text-right">
          <div className={`${compact ? 'text-xs' : 'text-sm'} ${
            isDark ? 'text-white/60' : 'text-gray-500'
          }`}>
            Current Price:
          </div>
          <div className={`${compact ? 'text-sm' : 'text-base'} font-semibold ${
            currentPrice > entryPrice 
              ? isDark ? 'text-emerald-400' : 'text-emerald-600'
              : currentPrice < entryPrice
                ? isDark ? 'text-red-400' : 'text-red-600'
                : isDark ? 'text-white' : 'text-gray-900'
          }`}>
            ${currentPrice.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
