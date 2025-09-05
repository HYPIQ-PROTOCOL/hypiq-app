'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { BettingModal } from '@/components/modals/BettingModal'
import { useWallet } from '@/contexts/PrivyWalletContext'
import { formatCurrency, formatLargeNumber } from '@/lib/utils'
import { TrendingUp, Users, DollarSign, Zap, Timer, Wallet } from 'lucide-react'

interface MarketCardProps {
  market: {
    id: string
    title: string
    description: string
    creator: {
      name: string
      avatar: string
      address: string
    }
    position: {
      type: string
      amount: string
      currency: string
    }
    yesPrice: number
    noPrice: number
    yesVolume: number
    noVolume: number
    totalVolume: number
    endTime: Date
    category: string
    participants: number
    timeLeft: string
    status: 'active' | 'ending-soon' | 'ended'
  }
}

export function MarketCard({ market }: MarketCardProps) {
  const { isConnected, connect } = useWallet()
  const [showBettingModal, setShowBettingModal] = useState(false)
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes')

  const yesPercentage = (market.yesPrice * 100)
  const noPercentage = (market.noPrice * 100)

  const handleBet = async (side: 'yes' | 'no') => {
    if (!isConnected) {
      await connect()
      return
    }
    
    setSelectedSide(side)
    setShowBettingModal(true)
  }

  // Dynamic card styling based on position type
  const isLong = market.position.type === 'longed'
  const cardHoverColor = isLong ? 'hover:shadow-green-500/20' : 'hover:shadow-red-500/20'

  return (
    <>
      <Card className="bg-white/10 border border-white/20 rounded-lg p-4 hover:shadow-md hover:bg-white/15 transition-all duration-300 cursor-pointer group text-white">
        {/* Header with position info - Kalshi style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-sm bg-white/20 text-white">{market.creator.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{market.creator.name}</p>
                <p className="text-xs text-white/70">
                  {market.position.type} {market.position.amount} {market.position.currency}
                </p>
              </div>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isLong ? 'LONG' : 'SHORT'}
          </div>
        </div>

        {/* Question - Dark theme */}
        <h3 className="text-base font-medium text-white mb-4 leading-tight">
          Will this position close in profit?
        </h3>

        {/* Betting Options - Dark theme Kalshi style */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant="outline"
            onClick={() => handleBet('yes')}
            className="h-12 p-3 flex flex-col items-center justify-center gap-1 border border-white/20 hover:border-kalshi-accent hover:bg-kalshi-accent/20 transition-all group/yes bg-kalshi-accent/10"
          >
            <span className="text-xs font-medium text-white/70 group-hover/yes:text-kalshi-accent">YES</span>
            <span className="text-lg font-bold text-kalshi-accent">{yesPercentage.toFixed(0)}¢</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleBet('no')}
            className="h-12 p-3 flex flex-col items-center justify-center gap-1 border border-white/20 hover:border-red-500 hover:bg-red-500/20 transition-all group/no bg-red-500/10"
          >
            <span className="text-xs font-medium text-white/70 group-hover/no:text-red-400">NO</span>
            <span className="text-lg font-bold text-red-400">{noPercentage.toFixed(0)}¢</span>
          </Button>
        </div>

        {/* Volume and participants - Dark theme */}
        <div className="flex items-center justify-between text-sm text-white/70 pt-3 border-t border-white/20">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatLargeNumber(market.totalVolume)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {market.participants}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>Live</span>
          </div>
        </div>

        {/* Price movement indicator - Dark theme */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-kalshi-accent transition-all duration-500" 
              style={{ width: `${yesPercentage}%` }}
            />
          </div>
          <span className="ml-3 text-xs font-medium text-white/70">
            {yesPercentage.toFixed(0)}% / {noPercentage.toFixed(0)}%
          </span>
        </div>
      </Card>

      <BettingModal
        isOpen={showBettingModal}
        onClose={() => setShowBettingModal(false)}
        position={{
          id: market.id,
          symbol: market.title,
          whaleAddress: market.creator.address,
          positionType: market.position.type,
          positionSize: market.totalVolume,
          currentPnl: yesPercentage - 50,
          profitOdds: selectedSide === 'yes' ? market.yesPrice : market.noPrice,
          lossOdds: selectedSide === 'yes' ? market.noPrice : market.yesPrice,
        }}
        side={selectedSide === 'yes' ? 'profit' : 'loss'}
      />
    </>
  )
} 