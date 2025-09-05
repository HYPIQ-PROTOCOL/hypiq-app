'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { buildSlug } from '@/lib/slug'
import Image from 'next/image'
import { OddsProgressBar } from '@/components/shared/OddsProgressBar'
import { MarketTopIndicators } from '@/components/shared/MarketTopIndicators'
import { PositionBadge } from '@/components/shared/PositionBadge'
import { PositionDistributionBar } from '@/components/shared/PositionDistributionBar'
import { ProfitLossLineChart } from '@/components/shared/ProfitLossLineChart'
import { getLogoKeyFromTitle, getPositionInfo, type EventMarket } from '@/lib/whale-utils'

interface WhaleMarketCardProps {
  market: EventMarket
  isActive?: boolean
  theme?: 'light' | 'dark'
  compact?: boolean
  showTopIndicators?: boolean
}

export function WhaleMarketCard({ market, isActive = true, theme = 'light', compact = false, showTopIndicators = true }: WhaleMarketCardProps) {
  const slug = buildSlug(market.title)
  const positionInfo = getPositionInfo(market.title)
  const isDark = theme === 'dark'
  const topTwo = useMemo(() => {
    const sorted = [...market.options].sort((a,b) => b.percent - a.percent)
    return sorted.slice(0, 2)
  }, [market.options])

  // Calculate profit/loss indicator for top left
  const profitLossIndicator = useMemo(() => {
    const primaryOption = topTwo[0]
    if (!primaryOption) return undefined
    
    const isProfit = primaryOption.name.includes('Profit')
    const percentage = primaryOption.percent
    
    // Calculate cents based on percentage (mock calculation similar to betting odds)
    const cents = Math.round((percentage / 100) * 50) // Simplified calculation
    const isPositive = isProfit && percentage > 50
    
    return {
      isPositive,
      cents,
      percentage,
      symbol: isPositive ? '+' : '',
      color: isPositive ? 'emerald' as const : 'red' as const
    }
  }, [topTwo])
  
  return (
    <div className="relative">
      <div className={isActive ? '' : 'pointer-events-none'}>
        <Link href={`/market/${slug}`} className="block">
                     <Card className={`relative overflow-hidden rounded-lg transition h-full ${
             compact ? 'p-3' : 'p-4'
           } ${
             isDark 
               ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-2xl'
               : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-[#0e241f]/20 shadow-sm hover:shadow-md'
           }`}>
             {/* Top Row: Position Badge, Coin Name with Logo, and Volume */}
             {showTopIndicators && (
               <MarketTopIndicators
                 positionBadge={{
                   position: positionInfo.position,
                   theme: theme
                 }}
                 volume={market.volume}
                 profitVolume={market.volume * (topTwo.find(opt => opt.name.includes('Profit'))?.percent || 0) / 100}
                 lossVolume={market.volume * (topTwo.find(opt => opt.name.includes('Lose'))?.percent || 0) / 100}
                 coinName={positionInfo.coin}
                 coinLogo={market.imageUrl || (getLogoKeyFromTitle(market.title) ? `/coin-logos/${getLogoKeyFromTitle(market.title)}.png` : undefined)}
                 theme={theme}
                 compact={compact}
               />
             )}
             
                          {/* Horizontal separator line */}
             {showTopIndicators && (
               <div className={`w-full h-px mb-4 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${
                 isDark ? 'text-white' : 'text-gray-400'
               }`} />
             )}
             
             {/* Amount Display */}
            <div className={`${compact ? 'mb-2' : 'mb-3'}`}>
              <div className={`${compact ? 'text-lg' : 'text-xl'} font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              } text-center`}>
                {positionInfo.amount}
              </div>
              <div className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'} text-center mt-1`}>
                <span>Whale Position</span>
              </div>
            </div>

                        {/* Position Distribution Bar with Buttons */}
            <div className="mt-2">
              <PositionDistributionBar
                profitPercentage={topTwo.find(opt => opt.name.includes('Profit'))?.percent || 0}
                lossPercentage={topTwo.find(opt => opt.name.includes('Lose'))?.percent || 0}
                theme={theme}
                height="md"
                showButtons={!compact}
                onLossClick={() => {
                  // Handle loss betting
                  console.log('Betting on loss')
                }}
                onProfitClick={() => {
                  // Handle profit betting  
                  console.log('Betting on profit')
                }}
              />
            </div>

            {/* Bottom Section: Profit/Loss Line Chart with Prices */}
            <ProfitLossLineChart
              coinSymbol={positionInfo.coin}
              entryPrice={120000} // Mock data - will connect to real data later
              positionType={positionInfo.position}
              theme={theme}
              compact={compact}
            />

           </Card>
        </Link>
      </div>
      {!isActive && (
        <div className="pointer-events-auto absolute inset-0 rounded-lg overflow-hidden cursor-not-allowed z-0">
          <div className={`absolute inset-0 rounded-lg backdrop-blur-md ${
            isDark ? 'bg-black/80' : 'bg-gray-100/80'
          }`} />
          <div className="relative h-full flex items-center justify-center">
            <div className="rotate-[-12deg] translate-x-2">
              <span className={`px-4 py-1 rounded-md border shadow-lg ${
                compact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'
              } font-extrabold tracking-[0.3em] ${
                isDark 
                  ? 'border-white/20 bg-white/10 text-white/70'
                  : 'border-[#0e241f]/20 bg-[#0e241f]/10 text-black/70'
              }`}>
                SOON
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
