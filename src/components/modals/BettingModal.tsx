'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/contexts/PrivyWalletContext'
import { DollarSign, TrendingUp, TrendingDown, Wallet, AlertCircle, CheckCircle } from 'lucide-react'

interface BettingModalProps {
  isOpen: boolean
  onClose: () => void
  position: {
    id: string
    symbol: string
    whaleAddress: string
    positionType: string
    positionSize: number
    currentPnl: number
    profitOdds: number
    lossOdds: number
  }
  side: 'profit' | 'loss'
}

export function BettingModal({ isOpen, onClose, position, side }: BettingModalProps) {
  const { isConnected, balance, placeBet, connect } = useWallet()
  const [amount, setAmount] = useState('50')
  const [isPlacing, setIsPlacing] = useState(false)
  const [success, setSuccess] = useState(false)

  const betAmount = parseFloat(amount) || 0
  const odds = side === 'profit' ? position.profitOdds : position.lossOdds
  const potentialPayout = betAmount * odds
  const potentialProfit = potentialPayout - betAmount

  const canAfford = betAmount <= balance
  const isValidAmount = betAmount > 0 && betAmount >= 1 // Minimum $1 bet

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const setMaxAmount = () => {
    setAmount(balance.toString())
  }

  const setQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handlePlaceBet = async () => {
    if (!isConnected) {
      await connect()
      return
    }

    if (!canAfford || !isValidAmount) return

    setIsPlacing(true)
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      placeBet(
        position.id,
        `${position.symbol} ${position.positionType}`,
        side,
        betAmount,
        odds
      )
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        setAmount('50') // Reset
      }, 2000)
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsPlacing(false)
    }
  }

  const handleClose = () => {
    if (!isPlacing) {
      onClose()
      setAmount('50')
      setSuccess(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {success ? 'Bet Placed!' : 'Place Your Bet'}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto animate-bounce" />
            <p className="text-lg text-white">Your bet has been placed successfully!</p>
            <p className="text-sm text-white/70">Check your positions to track this trade.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Position Info */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{position.symbol}</h3>
                <Badge variant={side === 'profit' ? 'default' : 'destructive'} className="text-xs">
                  {side === 'profit' ? 'PROFIT' : 'LOSS'}
                </Badge>
              </div>
              <p className="text-sm text-white/70 mb-3">
                Whale Address: {position.whaleAddress.slice(0, 8)}...{position.whaleAddress.slice(-6)}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Current Odds:</span>
                <span className="font-bold text-[#acf3e1]">{odds.toFixed(2)}x</span>
              </div>
            </div>

            {/* Wallet Connection */}
            {!isConnected && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Connect Your Wallet</p>
                    <p className="text-sm text-white/70">Connect to place bets and track positions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Display */}
            {isConnected && (
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                <span className="text-white/70">Available Balance:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="font-bold text-white">${balance.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Bet Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-[#acf3e1]"
                  disabled={!isConnected}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(25)}
                  className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                  disabled={!isConnected}
                >
                  $25
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(50)}
                  className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                  disabled={!isConnected}
                >
                  $50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(100)}
                  className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                  disabled={!isConnected}
                >
                  $100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setMaxAmount}
                  className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                  disabled={!isConnected}
                >
                  Max
                </Button>
              </div>

              {/* Validation Messages */}
              {isConnected && betAmount > 0 && (
                <>
                  {!canAfford && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Insufficient balance
                    </div>
                  )}
                  {betAmount < 1 && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Minimum bet is $1.00
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payout Calculation */}
            {isConnected && betAmount > 0 && canAfford && isValidAmount && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Payout Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Bet Amount:</span>
                    <span className="text-white">${betAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Odds:</span>
                    <span className="text-white">{odds.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Potential Payout:</span>
                    <span className="text-[#acf3e1] font-bold">${potentialPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/70">Potential Profit:</span>
                    <span className="text-green-400 font-bold">+${potentialProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
                disabled={isPlacing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlaceBet}
                disabled={!isConnected ? false : (!canAfford || !isValidAmount || isPlacing)}
                className="flex-1 bg-[#acf3e1] text-black hover:bg-[#acf3e1]/90 font-medium"
              >
                {isPlacing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Placing Bet...
                  </div>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : (
                  `Bet $${betAmount.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 