'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { PrivyClientConfig, PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import { PRIVY_APP_ID, privyConfig } from '@/lib/privy-config'

// Keep the same Position interface for compatibility
export interface Position {
  id: string
  marketId: string
  marketTitle: string
  side: 'profit' | 'loss'
  amount: number
  odds: number
  potentialPayout: number
  timestamp: Date
  status: 'active' | 'won' | 'lost'
  currentPnl?: number
}

interface WalletContextType {
  // Wallet connection
  isConnected: boolean
  address: string | null
  balance: number
  connect: () => Promise<void>
  disconnect: () => void
  
  // Trading (same as before for compatibility)
  positions: Position[]
  placeBet: (marketId: string, marketTitle: string, side: 'profit' | 'loss', amount: number, odds: number) => void
  
  // Balance management (same as before)
  deductBalance: (amount: number) => boolean
  addBalance: (amount: number) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Inner component that uses Privy hooks
function PrivyWalletProviderInner({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  const [balance, setBalance] = useState(382.35) // Mock starting balance
  const [positions, setPositions] = useState<Position[]>([])

  // Get the connected wallet address
  const address = wallets[0]?.address || null
  const isConnected = authenticated && !!address

  // Load saved data from localStorage (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedPositions = localStorage.getItem('positions')
    const savedBalance = localStorage.getItem('balance')

    if (savedPositions) {
      try {
        const parsedPositions = JSON.parse(savedPositions).map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }))
        setPositions(parsedPositions)
      } catch (error) {
        console.error('Error parsing saved positions:', error)
      }
    }

    if (savedBalance) {
      try {
        setBalance(parseFloat(savedBalance))
      } catch (error) {
        console.error('Error parsing saved balance:', error)
      }
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('positions', JSON.stringify(positions))
  }, [positions])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('balance', balance.toString())
  }, [balance])

  const connect = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnect = () => {
    logout()
  }

  const deductBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount)
      return true
    }
    return false
  }

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount)
  }

  const placeBet = (marketId: string, marketTitle: string, side: 'profit' | 'loss', amount: number, odds: number) => {
    if (!deductBalance(amount)) {
      throw new Error('Insufficient balance')
    }

    const newPosition: Position = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      marketId,
      marketTitle,
      side,
      amount,
      odds,
      potentialPayout: amount * odds,
      timestamp: new Date(),
      status: 'active',
      currentPnl: 0
    }

    setPositions(prev => [newPosition, ...prev])
  }

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
    positions,
    placeBet,
    deductBalance,
    addBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Main provider component that wraps everything with Privy
export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  // If no Privy App ID is provided, fall back to simple wallet provider
  if (!PRIVY_APP_ID) {
    return <SimpleWalletProvider>{children}</SimpleWalletProvider>
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={privyConfig as PrivyClientConfig}
    >
      <PrivyWalletProviderInner>
        {children}
      </PrivyWalletProviderInner>
    </PrivyProvider>
  )
}

// Simple fallback wallet provider (similar to the old one but without conflicts)
function SimpleWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState(382.35)
  const [positions, setPositions] = useState<Position[]>([])

  const connect = async () => {
    // Simulate connection for demo
    const mockAddress = '0x742d35Cc6Ba1f23e8976543dcF1234567890abcd'
    setAddress(mockAddress)
    setIsConnected(true)
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
  }

  const deductBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount)
      return true
    }
    return false
  }

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount)
  }

  const placeBet = (marketId: string, marketTitle: string, side: 'profit' | 'loss', amount: number, odds: number) => {
    if (!deductBalance(amount)) {
      throw new Error('Insufficient balance')
    }

    const newPosition: Position = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      marketId,
      marketTitle,
      side,
      amount,
      odds,
      potentialPayout: amount * odds,
      timestamp: new Date(),
      status: 'active',
      currentPnl: 0
    }

    setPositions(prev => [newPosition, ...prev])
  }

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
    positions,
    placeBet,
    deductBalance,
    addBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Export the same hook name for compatibility
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a PrivyWalletProvider')
  }
  return context
}
