import axios from 'axios'
import type { 
  WhalePosition, 
  BettingMarket, 
  Bet, 
  User, 
  MarketStats, 
  WhaleStats,
  ApiResponse 
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Whale Position API
export const whalePositionApi = {
  getActivePositions: async (): Promise<ApiResponse<WhalePosition[]>> => {
    const response = await api.get('/whale-positions/active')
    return response.data
  },

  getPositionById: async (id: string): Promise<ApiResponse<WhalePosition>> => {
    const response = await api.get(`/whale-positions/${id}`)
    return response.data
  },

  getPositionsByWhale: async (address: string): Promise<ApiResponse<WhalePosition[]>> => {
    const response = await api.get(`/whale-positions/whale/${address}`)
    return response.data
  },
}

// Betting Market API
export const marketApi = {
  getActiveMarkets: async (): Promise<ApiResponse<BettingMarket[]>> => {
    const response = await api.get('/markets/active')
    return response.data
  },

  getMarketById: async (id: string): Promise<ApiResponse<BettingMarket>> => {
    const response = await api.get(`/markets/${id}`)
    return response.data
  },

  getMarketsByPosition: async (positionId: string): Promise<ApiResponse<BettingMarket[]>> => {
    const response = await api.get(`/markets/position/${positionId}`)
    return response.data
  },
}

// Betting API
export const bettingApi = {
  placeBet: async (bet: Omit<Bet, 'id' | 'placedAt' | 'status'>): Promise<ApiResponse<Bet>> => {
    const response = await api.post('/bets', bet)
    return response.data
  },

  getUserBets: async (userId: string): Promise<ApiResponse<Bet[]>> => {
    const response = await api.get(`/bets/user/${userId}`)
    return response.data
  },

  getBetsByMarket: async (marketId: string): Promise<ApiResponse<Bet[]>> => {
    const response = await api.get(`/bets/market/${marketId}`)
    return response.data
  },
}

// User API
export const userApi = {
  getUserProfile: async (address: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${address}`)
    return response.data
  },

  updateUserProfile: async (address: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${address}`, data)
    return response.data
  },
}

// Statistics API
export const statsApi = {
  getMarketStats: async (): Promise<ApiResponse<MarketStats>> => {
    const response = await api.get('/stats/markets')
    return response.data
  },

  getWhaleStats: async (address?: string): Promise<ApiResponse<WhaleStats[]>> => {
    const url = address ? `/stats/whales/${address}` : '/stats/whales'
    const response = await api.get(url)
    return response.data
  },

  getLeaderboard: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/stats/leaderboard')
    return response.data
  },
}

// Blockchain integration (placeholder for future implementation)
export const blockchainApi = {
  // These will be implemented when blockchain integration is added
  connectWallet: async (): Promise<ApiResponse<string>> => {
    throw new Error('Blockchain integration not yet implemented')
  },

  getWalletBalance: async (address: string): Promise<ApiResponse<number>> => {
    throw new Error('Blockchain integration not yet implemented')
  },

  submitTransaction: async (txData: any): Promise<ApiResponse<string>> => {
    throw new Error('Blockchain integration not yet implemented')
  },
} 