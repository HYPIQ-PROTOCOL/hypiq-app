// Helper to infer coin logo from a market title
export const getLogoKeyFromTitle = (title: string): string | null => {
  const t = title.toLowerCase()
  if (/(hyperliquid|hype)\b/.test(t)) return 'hype'
  if (/(bitcoin|btc)\b/.test(t)) return 'bitcoin'
  if (/(ethereum|eth)\b/.test(t)) return 'ethereum'
  if (/\bxrp\b/.test(t)) return 'xrp'
  if (/(binance|bnb)\b/.test(t)) return 'bnb'
  if (/(solana|sol)\b/.test(t)) return 'solana'
  if (/\bdoge\b/.test(t)) return 'doge'
  return null
}

// Position type for future data integration
export type PositionType = 'LONG' | 'SHORT'

// Position info extracted from title (temporary until real data integration)
export interface PositionInfo {
  isLong: boolean
  isShort: boolean
  amount: string
  coin: string
  position: PositionType // Added for future data compatibility
}

// Extract position info from title
export const getPositionInfo = (title: string): PositionInfo => {
  const isLong = /LONG/i.test(title)
  const isShort = /SHORT/i.test(title)
  const amount = title.match(/(\d+M\$)/)?.[1] || ''
  const coin = title.match(/(BITCOIN|ETH|HYPE|BTC)/i)?.[1]?.toUpperCase() || ''
  
  return { 
    isLong, 
    isShort, 
    amount, 
    coin,
    position: isLong ? 'LONG' : 'SHORT' // Standardized position type
  }
}

// Types for whale market components
export type EventOption = {
  name: string
  percent: number
}

export type EventMarket = {
  id: string
  title: string
  options: EventOption[]
  volume: number
  imageUrl?: string
}
