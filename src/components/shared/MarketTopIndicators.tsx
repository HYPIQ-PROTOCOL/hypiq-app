'use client'

import Image from 'next/image'
import { PositionBadge } from './PositionBadge'
import { VolumeRadialChart } from './VolumeRadialChart'

interface MarketTopIndicatorsProps {
  positionBadge?: {
    position: 'LONG' | 'SHORT'
    theme?: 'light' | 'dark'
  }
  volume: number
  profitVolume?: number
  lossVolume?: number
  coinName?: string
  coinLogo?: string
  theme?: 'light' | 'dark'
  compact?: boolean
}

export function MarketTopIndicators({ 
  positionBadge, 
  volume, 
  profitVolume,
  lossVolume,
  coinName,
  coinLogo,
  theme = 'light', 
  compact = false 
}: MarketTopIndicatorsProps) {
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left: Position Badge */}
      <div className="flex-1 flex justify-start">
        {positionBadge && (
          <PositionBadge
            position={positionBadge.position}
            theme={theme}
            variant="badge"
            size="sm"
          />
        )}
      </div>
      
      {/* Center: Coin Logo + Name (same wrapper) */}
      <div className="flex-1 flex justify-center">
        {coinName && (
          <div className="flex items-center gap-2">
            {coinLogo && (
              <Image 
                src={coinLogo} 
                alt={coinName} 
                width={compact ? 16 : 20} 
                height={compact ? 16 : 20} 
                className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} rounded-sm object-cover`} 
              />
            )}
            <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              {coinName}
            </div>
          </div>
        )}
      </div>
      
      {/* Right: Volume with Radial Chart */}
      <div className="flex-1 flex justify-end">
        <VolumeRadialChart
          volume={volume}
          profitVolume={profitVolume}
          lossVolume={lossVolume}
          theme={theme}
          size={compact ? 'sm' : 'md'}
        />
      </div>
    </div>
  )
}
