'use client'

import { useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, TrendingDown, Link, Info, DollarSign, Calendar, Users, ChevronRight, Target, Zap, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { PositionDistributionBar } from '@/components/shared/PositionDistributionBar'
import { ProfitLossLineChart } from '@/components/shared/ProfitLossLineChart'

interface ChainedPrediction {
  id: string
  predictions: {
    id: string
    title: string
    description: string
    currentOdds: number
    potentialReward: number
    endDate: string
    participants: number
    outcome?: 'YES' | 'NO'
    imageUrl?: string
    profitPercentage: number
    lossPercentage: number
    entryPrice: number
    positionType: 'LONG' | 'SHORT'
  }[]
  totalVolume: number
  chainReward: number
  status: 'open' | 'pending' | 'resolved'
}

const mockChainedPrediction: ChainedPrediction = {
  id: 'btc-war-chain',
  predictions: [
    {
      id: 'btc-200k',
      title: 'Bitcoin hits $200K',
      description: 'Bitcoin reaches $200,000 USD before the end of 2025',
      currentOdds: 0.35,
      potentialReward: 2.86,
      endDate: 'Dec 31, 2025',
      participants: 1247,
      outcome: 'YES',
      imageUrl: '/coin-logos/bitcoin.png',
      profitPercentage: 67,
      lossPercentage: 33,
      entryPrice: 120000,
      positionType: 'LONG'
    },
    {
      id: 'ukraine-russia-war',
      title: 'Ukraine - Russia war ends',
      description: 'The war between Ukraine and Russia ends before 2026',
      currentOdds: 0.28,
      potentialReward: 3.57,
      endDate: 'Dec 31, 2026',
      participants: 892,
      outcome: 'YES',
      imageUrl: '/coin-logos/ethereum.png',
      profitPercentage: 72,
      lossPercentage: 28,
      entryPrice: 1800000,
      positionType: 'LONG'
    }
  ],
  totalVolume: 4300000,
  chainReward: 10.2,
  status: 'open'
}

const ChainedPredictionCard: React.FC<{ 
  chainedPrediction: ChainedPrediction;
  onCardClick: (id: string) => void;
  isExpanded: boolean;
  onExpand: (id: string) => void;
}> = ({ 
  chainedPrediction, 
  onCardClick,
  isExpanded,
  onExpand
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'open'
      case 'pending': return 'secondary'
      case 'resolved': return 'closed'
      default: return 'default'
    }
  }

  const getOutcomeColor = (outcome?: string) => {
    if (outcome === 'YES') return 'profit'
    if (outcome === 'NO') return 'loss'
    return 'secondary'
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`
    }
    return `$${volume}`
  }

  return (
    <Card className="relative overflow-hidden rounded-lg transition h-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-[#0e241f]/20 shadow-sm hover:shadow-md max-w-6xl mx-auto">
      {/* Predictions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chainedPrediction.predictions.map((prediction, index) => (
            <div key={prediction.id} className="relative">
              {/* Connection Line */}
              {index < chainedPrediction.predictions.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#0e241f] z-10"></div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Prediction Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {prediction.imageUrl && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white">
                        <Image 
                          src={prediction.imageUrl} 
                          alt="Asset" 
                          width={40} 
                          height={40} 
                          className="w-10 h-10 object-contain" 
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{prediction.title}</h3>
                      <p className="text-sm text-gray-600">{prediction.description}</p>
                    </div>
                  </div>
                  {prediction.outcome && (
                    <Badge variant={getOutcomeColor(prediction.outcome)} className="ml-2">
                      {prediction.outcome}
                    </Badge>
                  )}
                </div>

                {/* Prediction Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                    <div className="text-lg font-bold text-blue-600">
                      {(prediction.currentOdds * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Current Odds</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                    <div className="text-lg font-bold text-green-600">
                      {prediction.potentialReward}x
                    </div>
                    <div className="text-xs text-gray-500">Potential Reward</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                    <div className="text-sm font-medium text-gray-800">
                      {prediction.endDate}
                    </div>
                    <div className="text-xs text-gray-500">End Date</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                    <div className="text-sm font-medium text-gray-800">
                      {prediction.participants.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Participants</div>
                  </div>
                </div>

                {/* Position Distribution Bar */}
                <div className="mb-4">
                  <PositionDistributionBar
                    profitPercentage={prediction.profitPercentage}
                    lossPercentage={prediction.lossPercentage}
                    theme="light"
                    height="md"
                    showButtons={false}
                  />
                </div>

                {/* Profit/Loss Line Chart */}
                <div className="border-t border-gray-200 pt-3">
                  <ProfitLossLineChart
                    coinSymbol={prediction.title.split(' ')[0]}
                    entryPrice={prediction.entryPrice}
                    positionType={prediction.positionType}
                    theme="light"
                    compact={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function ChainedPredictionsPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const handleCardClick = (id: string) => {
    setSelectedCard(selectedCard === id ? null : id)
  }

  const handleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Single Chained Prediction Card */}
          <div className="mb-16">
            <ChainedPredictionCard
              chainedPrediction={mockChainedPrediction}
              onCardClick={handleCardClick}
              isExpanded={expandedCard === mockChainedPrediction.id}
              onExpand={handleExpand}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
