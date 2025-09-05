'use client'

import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface PositionDistributionBarProps {
  profitPercentage: number
  lossPercentage: number
  theme?: 'light' | 'dark'
  height?: 'sm' | 'md' | 'lg'
  showButtons?: boolean
  onLossClick?: () => void
  onProfitClick?: () => void
}

export function PositionDistributionBar({ 
  profitPercentage, 
  lossPercentage, 
  theme = 'light',
  height = 'sm',
  showButtons = false,
  onLossClick,
  onProfitClick
}: PositionDistributionBarProps) {
  const isDark = theme === 'dark'
  
  // Ensure percentages add up to 100
  const total = profitPercentage + lossPercentage
  const normalizedProfit = total > 0 ? (profitPercentage / total) * 100 : 50
  const normalizedLoss = total > 0 ? (lossPercentage / total) * 100 : 50
  
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2', 
    lg: 'h-3'
  }
  
  return (
    <div className="mb-3">
      {/* Single wrapper with buttons and aligned progress bar */}
      <div className="flex items-start gap-4 w-full">
        {showButtons ? (
          <div className="flex flex-col items-center">
            <Button 
              size="sm" 
              variant="outline"
              className={`h-7 px-3 rounded-full flex items-center gap-1 ${
                isDark 
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-700'
                  : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-700'
              }`}
              onClick={onLossClick}
            >
              Will Loss
            </Button>
            {/* Chevron and percentage below button */}
            <div className="flex flex-col items-center mt-1">
              <ChevronDown className={`h-3 w-3 mb-0.5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {Math.round(normalizedLoss)}%
              </span>
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-1 ${
            isDark ? 'text-red-400' : 'text-red-600'
          }`}>
            <span>{Math.round(normalizedLoss)}% Loss</span>
          </div>
        )}
        
        {/* Segmented Distribution bar - aligned with button height */}
        <div className="flex-1 flex gap-0.5 items-center" style={{ height: '28px' }}>
          {/* Create 10 segments */}
          {Array.from({ length: 10 }, (_, i) => {
            const segmentThreshold = ((i + 1) / 10) * 100
            const isLossSegment = segmentThreshold <= normalizedLoss
            return (
              <div 
                key={i}
                className={`flex-1 ${heightClasses[height]} rounded-sm transition-all duration-300 ${
                  isLossSegment ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
            )
          })}
        </div>
        
        {showButtons ? (
          <div className="flex flex-col items-center">
            <Button 
              size="sm" 
              variant="outline"
              className={`h-7 px-3 rounded-full flex items-center gap-1 ${
                isDark 
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-700'
              }`}
              onClick={onProfitClick}
            >
              Will Profit
            </Button>
            {/* Chevron and percentage below button */}
            <div className="flex flex-col items-center mt-1">
              <ChevronUp className={`h-3 w-3 mb-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>
                {Math.round(normalizedProfit)}%
              </span>
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-1 ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            <span>{Math.round(normalizedProfit)}% Profit</span>
          </div>
        )}
      </div>
    </div>
  )
}
