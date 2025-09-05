'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { OrderBook, OrderBookData } from '@/components/ui/OrderBook'
import { findMarketBySlug } from '@/data/markets'
import { capitalizeTitle } from '@/lib/slug'
import { generateMarketRules } from '@/lib/ruleGenerator'
import { inferTimelineFromTitle, formatDateET } from '@/lib/timeline'
import { useHyperliquidPrice } from '@/hooks/useHyperliquidPrice'
import { Calendar, ChevronDown, Book } from 'lucide-react'

function CollapsibleSection({ title, children, defaultOpen = false, icon }: { title: string, children: React.ReactNode, defaultOpen?: boolean, icon?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white/5 border border-white/10 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-white/90">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0' } grid`}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

CollapsibleSection.InjectStyles = function InjectStyles() { return null }

export default function UpDownMarketPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ''
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [priceHistory, setPriceHistory] = useState<Array<{t: number, price: number}>>([])
  const [smoothPriceHistory, setSmoothPriceHistory] = useState<Array<{t: number, price: number}>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Spring-smoothed display price (critically damped)
  const [displayPrice, setDisplayPrice] = useState<number | null>(null)
  const springTargetRef = useRef<number>(0)
  const springValueRef = useRef<number>(0)
  const springVelocityRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  // Compute market without a hook to allow safe early return before any hooks
  const market = findMarketBySlug(slug)
  
  // Extract coin name from market title for WebSocket connection
  const coinName = useMemo(() => {
    if (!market) return 'BTC'
    const title = market.title.toLowerCase()
    if (title.includes('bitcoin') || title.includes('btc')) return 'bitcoin'
    if (title.includes('ethereum') || title.includes('eth')) return 'ethereum'
    if (title.includes('hyperliquid') || title.includes('hype')) return 'hyperliquid'
    return 'bitcoin' // default
  }, [market])

  const { priceData, isConnected, error, symbol } = useHyperliquidPrice(coinName)
  
  const notFoundView = (
    <div className="min-h-screen bg-[#0e241f] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Market Not Found</h1>
        <p className="text-white/60">The market you&rsquo;re looking for doesn&rsquo;t exist.</p>
      </div>
    </div>
  )

  // Update price history when new price data arrives (less frequent updates)
  useEffect(() => {
    if (priceData) {
      setPriceHistory(prev => {
        const now = Date.now()
        const newEntry = { t: now, price: priceData.price }
        
        if (prev.length > 0) {
          const lastEntry = prev[prev.length - 1]
          const timeDiff = now - lastEntry.t
          const priceDiff = Math.abs(priceData.price - lastEntry.price)
          
          // Only add new point if significant time passed or price changed significantly
          if (timeDiff >= 3000 || priceDiff > 1) { // 3 seconds or $1 change
            const updated = [...prev, newEntry]
            return updated.slice(-100) // Keep last 100 key points
          }
          
          // Update last entry if price changed
          if (priceDiff > 0.01) {
            return [...prev.slice(0, -1), newEntry]
          }
          
          return prev
        }
        
        return [newEntry]
      })
    }
  }, [priceData])

  // Seed and update spring target when new price ticks arrive
  useEffect(() => {
    if (priceData?.price != null) {
      const p = priceData.price
      if (displayPrice === null) {
        springValueRef.current = p
        setDisplayPrice(p)
      }
      springTargetRef.current = p
    }
  }, [priceData?.price, displayPrice])

  // Run animation frame loop for critically damped spring
  useEffect(() => {
    const OMEGA = 6.0 // natural frequency (rad/s)
    const ZETA = 1.0  // damping ratio (critically damped)

    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) // cap to 50ms to remain stable
      last = now

      const x = springValueRef.current
      const v = springVelocityRef.current
      const target = springTargetRef.current

      // x'' + 2ζω x' + ω²(x - target) = 0
      const ax = -2 * ZETA * OMEGA * v - OMEGA * OMEGA * (x - target)
      const vNext = v + ax * dt
      const xNext = x + vNext * dt

      springValueRef.current = xNext
      springVelocityRef.current = vNext
      setDisplayPrice(xNext)

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Initialize with mock data and create ultra-smooth 60-second flowing chart
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Generate smooth flowing data for last 60 seconds
    const generateFlowingData = () => {
      const now = Date.now()
      const timeWindow = 60000 // 60 seconds
      const startTime = now - timeWindow
      const points: Array<{t: number, price: number}> = []
      
      // Use spring-smoothed display price when available
      const currentPrice = (displayPrice ?? priceData?.price ?? priceHistory[priceHistory.length - 1]?.price ?? 119140)
      
      // Generate 120 ultra-smooth points (2 per second for 60 seconds)
      for (let i = 0; i < 120; i++) {
        const timestamp = startTime + (i * 500) // Every 500ms for ultra-smooth flow
        let price = currentPrice
        
        if (priceHistory.length > 1) {
          // Find the best price points for interpolation
          let beforePoint = priceHistory[0]
          let afterPoint = priceHistory[priceHistory.length - 1]
          
          for (let j = 0; j < priceHistory.length - 1; j++) {
            const point1 = priceHistory[j]
            const point2 = priceHistory[j + 1]
            
            if (timestamp >= point1.t && timestamp <= point2.t) {
              beforePoint = point1
              afterPoint = point2
              break
            } else if (timestamp >= point1.t) {
              beforePoint = point1
            }
          }
          
          // Smooth interpolation with easing
          if (beforePoint !== afterPoint && afterPoint.t !== beforePoint.t) {
            const progress = (timestamp - beforePoint.t) / (afterPoint.t - beforePoint.t)
            const smoothProgress = Math.max(0, Math.min(1, progress))
            // Add smooth easing for natural price movement
            const easedProgress = smoothProgress * smoothProgress * (3 - 2 * smoothProgress)
            price = beforePoint.price + (afterPoint.price - beforePoint.price) * easedProgress
          }
        } else {
          // If no price history, create subtle variations around current price
          const variation = Math.sin(i / 20) * 15 + Math.cos(i / 30) * 10
          price = currentPrice + variation
        }
        
        points.push({ t: timestamp, price })
      }
      
      // Ensure the head of the series snaps to the spring-smoothed price
      if (points.length > 0) {
        points[points.length - 1] = { t: points[points.length - 1].t, price: currentPrice }
      }
      
      setSmoothPriceHistory(points)
    }

    // Generate initial data immediately
    generateFlowingData()

    // Update every 500ms for ultra-smooth 60-second flow
    intervalRef.current = setInterval(generateFlowingData, 500)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [priceHistory, priceData, displayPrice])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Generate chart data from smooth interpolated price history
  const chartData = useMemo(() => {
    // Always use smoothPriceHistory if available, it should always have data now
    if (smoothPriceHistory.length > 0) {
      return smoothPriceHistory.map((entry, index) => ({
        t: index, // Sequential index for smooth x-axis
        price: entry.price,
        timestamp: entry.t,
        timeLabel: new Date(entry.t).toLocaleTimeString('en-US', { 
          hour12: true, 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit'
        }),
        dateLabel: new Date(entry.t).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }))
    }
    
    // Emergency fallback if smooth data is not ready yet
    const now = Date.now()
    const currentPrice = priceData?.price || 119140
    
    return Array.from({ length: 120 }, (_, i) => {
      const timestamp = now - (120 - i) * 500 // 60 seconds ago to now
      const variation = Math.sin(i / 20) * 15 + Math.cos(i / 30) * 10
      
      return {
        t: i,
        price: currentPrice + variation,
        timestamp,
        timeLabel: new Date(timestamp).toLocaleTimeString('en-US', { 
          hour12: true, 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit'
        }),
        dateLabel: new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    })
  }, [smoothPriceHistory, priceData])

  // Generate fixed time frame labels for 60-second window
  const timeFrameLabels = useMemo(() => {
    const now = Date.now()
    const labelCount = 6
    const timeWindow = 60000 // 60 seconds
    const totalPoints = 120 // 2 points per second
    
    return Array.from({ length: labelCount }, (_, i) => {
      const timeOffset = (i / (labelCount - 1)) * timeWindow
      const timestamp = now - timeWindow + timeOffset
      const index = Math.floor((i / (labelCount - 1)) * (totalPoints - 1))
      
      return {
        index,
        label: new Date(timestamp).toLocaleTimeString('en-US', { 
          hour12: true, 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit'
        }),
        timestamp
      }
    })
  }, []) // Fixed labels, not dependent on chart data

  // Mock order book data
  const orderBookData: OrderBookData = useMemo(() => ({
    asks: [
      { price: 28, contracts: 382, total: 770.05 },
      { price: 27, contracts: 2087, total: 663.09 },
      { price: 26, contracts: 12, total: 99.60 },
      { price: 24, contracts: 402, total: 96.48 },
    ],
    bids: [
      { price: 23, contracts: 324, total: 74.52 },
      { price: 22, contracts: 505, total: 185.62 },
      { price: 21, contracts: 1336, total: 466.18 },
      { price: 20, contracts: 308, total: 527.78 },
    ],
    lastTrade: { price: 24, direction: 'up' }
  }), [])

  const marketTitle = market?.title ?? ''
  const marketRules = useMemo(() => generateMarketRules(marketTitle), [marketTitle])
  const timeline = useMemo(() => inferTimelineFromTitle(marketTitle), [marketTitle])

  // Coin logo detection
  const getLogoKeyFromTitle = (title: string): string | null => {
    const t = title.toLowerCase()
    if (/(bitcoin|btc)\b/.test(t)) return 'bitcoin'
    if (/(ethereum|eth)\b/.test(t)) return 'ethereum'
    if (/(hyperliquid|hype)\b/.test(t)) return 'hype'
    return null
  }
  const logoKey = useMemo(() => getLogoKeyFromTitle(marketTitle), [marketTitle])
  const logoUrl = logoKey ? `/coin-logos/${logoKey}.png` : (market?.imageUrl || '/hypiq-logo.jpeg')

  // Sticky title bar behavior
  const HEADER_OFFSET = 104
  const titleBarRef = useRef<HTMLDivElement | null>(null)
  const titleInnerRef = useRef<HTMLDivElement | null>(null)
  const [isCondensed, setIsCondensed] = useState(false)
  const [titleHeight, setTitleHeight] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (titleInnerRef.current) {
        setTitleHeight(titleInnerRef.current.offsetHeight)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const top = titleBarRef.current?.getBoundingClientRect().top ?? Infinity
      setIsCondensed(top <= HEADER_OFFSET + 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (titleInnerRef.current) {
      setTitleHeight(titleInnerRef.current.offsetHeight)
    }
  }, [isCondensed])

  return !market ? (
    notFoundView
  ) : (
    <div className="min-h-screen bg-[#0e241f] text-white">
      <Navigation />
      <main className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <CollapsibleSection.InjectStyles />
        <section className="flex-1 lg:w-2/3">
          <div ref={titleBarRef} className="sticky top-[104px] z-30 bg-[#0e241f]/95 backdrop-blur-sm mb-2 -mx-4 px-4">
            <div
              ref={titleInnerRef}
              className={`flex items-center gap-3 ${isCondensed ? 'py-2' : 'py-3'}`}
            >
              <div className={`flex items-center justify-center ${isCondensed ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <Image src={logoUrl} alt="coin" width={40} height={40} className={`${isCondensed ? 'w-8 h-8' : 'w-10 h-10'} object-contain`} />
              </div>
              <h1 className={`${isCondensed ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold`}>
                Whale BTC Long Pozisyonu
              </h1>
            </div>
          </div>
          
          {/* Price Chart */}
          <div className="mb-6">
            <Card className="relative bg-white/10 border border-white/20 p-6">
              <div className="h-[280px] relative flex items-center justify-center">
                
                <ChartContainer config={{ 
                  price: { color: '#f59e0b', label: 'Price' }
                }} className="h-full w-full">
                  <LineChart 
                    data={chartData} 
                    margin={{ top: 35, right: 15, left: 25, bottom: 25 }}
                  >
                    <XAxis 
                      dataKey="t" 
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}
                      tickMargin={12}
                      ticks={timeFrameLabels.map(label => label.index)}
                      tickFormatter={(value) => {
                        const label = timeFrameLabels.find(l => l.index === value)
                        return label ? label.label : ''
                      }}
                    />
                    <YAxis 
                      orientation="right"
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}
                      tickMargin={12}
                      width={60}
                      domain={['dataMin - 50', 'dataMax + 50']} 
                      type="number"
                      tickFormatter={(value) => `$${value.toLocaleString(undefined, { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      })}`}
                    />
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255,255,255,0.1)" 
                      horizontal={true}
                      vertical={false}
                    />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload || payload.length === 0) return null
                        
                        const data = payload[0]?.payload
                        const price = payload[0]?.value as number
                        
                        return (
                          <div className="rounded-lg border bg-black/90 backdrop-blur-sm p-3 shadow-lg border-white/20">
                            <div className="space-y-2">
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-400">
                                  ${price?.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  })}
                                </div>
                                {data?.dateLabel && (
                                  <div className="text-xs text-white/60">
                                    {data.dateLabel}
                                  </div>
                                )}
                                {data?.timeLabel && (
                                  <div className="text-sm text-white/80 font-medium">
                                    {data.timeLabel}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }}
                      cursor={{
                        stroke: '#f59e0b',
                        strokeWidth: 1,
                        strokeDasharray: '3 3'
                      }}
                    />
                                         <Line 
                       type="basis" 
                       dataKey="price" 
                       stroke="var(--color-price)" 
                       dot={false}
                       strokeWidth={2.5}
                       connectNulls={true}
                       animationDuration={300}
                       animationEasing="ease-in-out"
                       isAnimationActive={true}
                     />
                    
                    {/* Separate dot for current price */}
                    {priceData && isConnected && chartData.length > 0 && (
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="transparent"
                        dot={(props: any) => {
                          const { payload, cx, cy, index } = props
                          const isLastPoint = index === chartData.length - 1
                          
                          if (isLastPoint) {
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={3} 
                                fill="#f59e0b" 
                                stroke="#fff" 
                                strokeWidth={1.5}
                                className="animate-pulse"
                              /> as any
                            )
                          }
                          return <g /> as any
                        }}
                        strokeWidth={0}
                        connectNulls={false}
                        animationDuration={0}
                        isAnimationActive={false}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Real-time Price Display */}
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <div className="text-xs text-white/70">{symbol || 'BTC'} LIVE</div>
                </div>
                {priceData ? (
                  <>
                    <div className="text-2xl font-bold text-orange-400 transition-all duration-300 ease-in-out">
                      ${((displayPrice ?? priceData?.price) ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-white/60 transition-opacity duration-200">
                      Updated: {new Date(priceData.timestamp).toLocaleTimeString()}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-400 animate-pulse">
                      $119,140.50
                    </div>
                    <div className="text-xs text-white/60">
                      {isConnected ? 'Connecting...' : 'Reconnecting...'}
                    </div>
                  </>
                )}
              </div>

              {/* Connection Status */}
              {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="text-xs text-red-400 bg-black/50 px-2 py-1 rounded">⚠ {error}</div>
                </div>
              )}


            </Card>
          </div>

          {/* Rules summary */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Whale Position Rules</h2>
            <Card className="bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                This market allows betting on how the whale&apos;s Bitcoin Long position will close. 
                <strong className="text-green-400"> PROFIT (+)</strong> option means the whale closes the position profitably (Bitcoin price rises). 
                <strong className="text-red-400"> LOSS (-)</strong> option means the whale closes the position at a loss (Bitcoin price falls).
                Position closing time and price data are sourced from Hyperliquid API.
              </p>
              <div className="flex gap-2">
                <button className="text-xs text-green-400 hover:text-green-300 transition">
                  View full rules
                </button>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition">
                  Help center
                </button>
              </div>
            </Card>
          </div>

          {/* Order Book */}
          <div className="mt-8">
            <CollapsibleSection title="Order book" defaultOpen={false} icon={<Book className="h-4 w-4" />}>
              <Card className="bg-white/5 border border-white/10 p-0">
                <OrderBook 
                  data={orderBookData} 
                  option1Label={market.options[0]?.name || 'Option 1'}
                  option2Label={market.options[1]?.name || 'Option 2'}
                  selectedOptionIndex={0}
                  onToggleOption={(i)=>console.log('toggle to', i)}
                  onPriceClick={(price, side) => console.log(`Clicked ${side} at ${price}¢`)}
                  hideTitle
                  unstyled
                />
              </Card>
            </CollapsibleSection>
          </div>

          {/* Timeline & payout */}
          <div className="mt-4">
            <CollapsibleSection title="Timeline and payout" defaultOpen={false} icon={<Calendar className="h-4 w-4" /> }>
              <Card className="bg-white/5 border border-white/10 p-4">
                <div className="relative pl-6">
                  <div className="absolute left-[6px] top-2 bottom-2 w-px bg-white/15"></div>
                  <div className="flex items-center gap-3 py-2">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                      <span className="absolute inset-0 rounded-full ring-2 ring-emerald-300/40"></span>
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white leading-tight">Market open</div>
                      <div className="text-xs text-white/70 leading-tight">{formatDateET(timeline.openAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="h-3 w-3 rounded-full bg-white/30"></span>
                      <span className="absolute inset-0 rounded-full ring-2 ring-white/30"></span>
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white leading-tight">Market closes</div>
                      <div className="text-xs text-white/70 leading-tight">{timeline.closesAtText}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="h-3 w-3 rounded-full bg-white/30"></span>
                      <span className="absolute inset-0 rounded-full ring-2 ring-white/30"></span>
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white leading-tight">Projected payout</div>
                      <div className="text-xs text-white/70 leading-tight">1 hour after closing</div>
                    </div>
                  </div>
                </div>
              </Card>
            </CollapsibleSection>
          </div>
          
        </section>

        <aside className="lg:w-1/3 lg:flex-shrink-0">
          <div className="space-y-4 lg:sticky lg:top-[202px] lg:self-start">
            {/* Trading Panel */}
            <Card className="bg-white/10 border border-white/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12">
                    <Image src={logoUrl} alt="market" width={48} height={48} className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <div className="text-sm text-white/90">Selected Market</div>
                    <div className="text-xs text-white/60">Demo only</div>
                  </div>
                </div>
                
                {/* Buy/Sell Switch */}
                <div className="flex relative">
                  <button 
                    onClick={() => setTradeType('buy')}
                    className={`relative z-10 px-4 py-2 text-xs font-semibold transition-all duration-300 ease-out rounded-md ${
                      tradeType === 'buy' 
                        ? 'bg-white/20 text-emerald-500 backdrop-blur-md border border-white/30 shadow-lg shadow-white/10' 
                        : 'text-emerald-400/40 hover:text-emerald-400/60'
                    }`}
                  >
                    Buy
                  </button>
                  <button 
                    onClick={() => setTradeType('sell')}
                    className={`relative z-10 px-4 py-2 text-xs font-semibold transition-all duration-300 ease-out rounded-md ${
                      tradeType === 'sell' 
                        ? 'bg-white/20 text-red-400 backdrop-blur-md border border-white/30 shadow-lg shadow-white/10' 
                        : 'text-red-400 hover:text-red-400/80'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>
              
              {/* Whale Position Outcome Options */}
              <div className="mb-4">
                <div className="text-xs text-white/70 mb-2 text-center">
                  How will Whale BTC Long position close?
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-md p-3 text-center transition-colors cursor-pointer"
                  >
                    <div className="text-emerald-400 font-bold text-lg mb-1">+</div>
                    <div className="text-white font-medium text-sm">PROFIT</div>
                    <div className="text-emerald-400 font-bold text-lg">67%</div>
                  </button>
                  <button 
                    className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 rounded-md p-3 text-center transition-colors cursor-pointer"
                  >
                    <div className="text-rose-400 font-bold text-lg mb-1">-</div>
                    <div className="text-white font-medium text-sm">LOSS</div>
                    <div className="text-rose-400 font-bold text-lg">33%</div>
                  </button>
                </div>
                <div className="text-xs text-white/50 text-center">
                  Bitcoin Long position: Price ↑ = Profit | Price ↓ = Loss
                </div>
              </div>

              <div className="text-xs text-white/60">Amount</div>
              <input className="w-full mt-1 mb-4 rounded bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none" placeholder="$0" />
              <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white">Connect Wallet to Trade</Button>

              <p className="text-xs text-white/70 text-center mt-3">
                By trading, you agree to the <a href="https://hypiq.finance/terms" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Terms of Use</a>.
              </p>
            </Card>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  )
}
