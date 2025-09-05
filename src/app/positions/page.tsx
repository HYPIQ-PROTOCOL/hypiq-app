'use client'

import { useWallet } from '@/contexts/PrivyWalletContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Clock, Target, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function PositionsPage() {
  const { isConnected, positions, balance, connect } = useWallet()

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const calculateCurrentPnL = (position: any) => {
    // Simulate price movement for demo
    const random = Math.random()
    const baseReturn = position.side === 'profit' ? random * 0.3 - 0.1 : random * 0.2 - 0.15
    return position.amount * baseReturn
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Link>
          </div>

          <div className="text-center py-16">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connect your wallet to view and manage your trading positions.
            </p>
            <Button onClick={connect} className="bg-[#acf3e1] text-black hover:bg-[#acf3e1]/90">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Positions</h1>
              <p className="text-muted-foreground">Track your active trades and performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">${balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold">{positions.filter(p => p.status === 'active').length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">
                    ${positions.reduce((sum, pos) => sum + pos.amount, 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Potential Payout</p>
                  <p className="text-2xl font-bold text-[#acf3e1]">
                    ${positions.reduce((sum, pos) => sum + pos.potentialPayout, 0).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#acf3e1]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions List */}
        {positions.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-2">No positions yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by placing your first bet on event market outcomes.
              </p>
              <Link href="/">
                <Button className="bg-[#acf3e1] text-black hover:bg-[#acf3e1]/90">
                  Explore Markets
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => {
              const currentPnL = calculateCurrentPnL(position)
              const isProfit = currentPnL >= 0
              
              return (
                <Card key={position.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Position Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white text-lg mb-1">
                              {position.marketTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Market ID: {position.marketId}
                            </p>
                          </div>
                          <Badge 
                            variant={position.side === 'profit' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {position.side.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Bet Amount</p>
                            <p className="font-medium">${position.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Odds</p>
                            <p className="font-medium">{position.odds.toFixed(2)}x</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Potential Payout</p>
                            <p className="font-medium text-[#acf3e1]">${position.potentialPayout.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Entry Time</p>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <p className="font-medium">{formatTimeAgo(position.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="lg:w-48">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-muted-foreground mb-2">Current P&L</p>
                          <div className="flex items-center gap-2">
                            {isProfit ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <span className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                              {isProfit ? '+' : ''}${currentPnL.toFixed(2)}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {isProfit ? '+' : ''}{((currentPnL / position.amount) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Position opened: {position.timestamp.toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
} 