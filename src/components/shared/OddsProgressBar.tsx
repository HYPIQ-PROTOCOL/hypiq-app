'use client'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

interface OddsProgressBarProps {
  label: string
  percentage: number
  isProfit?: boolean
  theme?: 'light' | 'dark'
  showButtons?: boolean
  onYesClick?: () => void
  onNoClick?: () => void
}

export function OddsProgressBar({ 
  label, 
  percentage, 
  isProfit = true, 
  theme = 'light',
  showButtons = true,
  onYesClick,
  onNoClick 
}: OddsProgressBarProps) {
  const isDark = theme === 'dark'
  
  return (
    <div className="flex items-center gap-3">
      {label && (
        <div className={`text-sm w-24 shrink-0 ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
          {label}
        </div>
      )}
      <div className="flex-1 flex items-center gap-3">
        <Progress
          value={percentage}
          className={`h-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'} ${
            isProfit 
              ? '[&>div]:from-emerald-500 [&>div]:to-emerald-400' 
              : '[&>div]:from-red-500 [&>div]:to-rose-400'
          }`}
        />
        <div className={`text-lg md:text-xl font-bold tabular-nums ${
          isDark 
            ? isProfit ? 'text-white' : 'text-white/80'
            : isProfit ? 'text-gray-900' : 'text-gray-700'
        }`}>
          {percentage}%
        </div>
      </div>
      {showButtons && (
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="outline"
            className={`h-7 px-3 rounded-full flex items-center gap-1 ${
              isDark 
                ? 'border-white/30 text-white hover:bg-white/10 hover:text-white'
                : isProfit
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-700'
                  : 'bg-transparent hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:text-emerald-700'
            }`}
            onClick={onYesClick}
          >
            <Check className="h-3.5 w-3.5" /> Yes
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className={`h-7 px-3 rounded-full flex items-center gap-1 ${
              isDark 
                ? 'border-white/30 text-white hover:bg-white/10 hover:text-white'
                : isProfit
                  ? 'bg-transparent hover:bg-red-50 border-red-200 text-red-700 hover:text-red-700'
                  : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-700'
            }`}
            onClick={onNoClick}
          >
            <X className="h-3.5 w-3.5" /> No
          </Button>
        </div>
      )}
    </div>
  )
}
