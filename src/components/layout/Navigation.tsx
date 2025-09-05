'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, DollarSign, User, LogOut, Bell, TrendingUp } from 'lucide-react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useWallet } from '@/contexts/PrivyWalletContext'
import { Suspense } from 'react'

function NavigationContent() {
  const { isConnected, address, balance, connect, disconnect } = useWallet()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isEventMarkets = pathname === '/' || pathname?.startsWith('/event-markets')

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal: number) => {
    return `$${bal.toFixed(2)}`
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-24 h-12 flex items-center justify-center">
                <Image 
                  src="/Logo-text.svg" 
                  alt="HYPIQ" 
                  width={120} 
                  height={24} 
                  className="object-contain" 
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </Link>
          </div>

          {/* Center - Categories */}
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
            {[
              { label: 'TRENDING', key: 'all', icon: true },
              { label: 'POLITICS', key: 'politics' },
              { label: 'ECONOMICS', key: 'economics' },
              { label: 'SPORTS', key: 'sports' },
              { label: 'CRYPTO', key: 'crypto' },
              { label: 'TECH', key: 'tech' },
              { label: 'HEALTH', key: 'health' },
              { label: 'WORLD', key: 'world' }
            ].map(({ label, key, icon }) => {
              const currentCategory = searchParams.get('category') || 'all'
              const isActive = currentCategory === key
              
              // Map categories to heatmap colors
              const getCategoryColors = (categoryKey: string) => {
                switch(categoryKey) {
                  case 'economics':
                    return 'bg-blue-100 text-blue-800 border-blue-200'
                  case 'sports':
                    return 'bg-green-100 text-green-800 border-green-200'
                  case 'crypto':
                    return 'bg-orange-100 text-orange-800 border-orange-200'
                  case 'tech':
                    return 'bg-purple-100 text-purple-800 border-purple-200'
                  case 'health':
                    return 'bg-red-100 text-red-800 border-red-200'
                  case 'politics':
                    return 'bg-cyan-100 text-cyan-800 border-cyan-200'
                  case 'world':
                    return 'bg-pink-100 text-pink-800 border-pink-200'
                  default:
                    return 'bg-indigo-100 text-indigo-800 border-indigo-200'
                }
              }
              
              return (
                <button
                  key={label}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('category', key)
                    router.push(`/?${params.toString()}`)
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    isActive 
                      ? getCategoryColors(key) + ' font-semibold'
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                  } ${icon ? 'flex items-center gap-1.5' : ''}`}
                >
                  {icon && <TrendingUp className="h-3 w-3" />}
                  {label}
                </button>
              )
            })}
          </div>

          {/* Right side - Actions and account */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-kalshi-accent rounded-full"></div>
                </Button>

                {/* Balance Display */}
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <DollarSign className="h-4 w-4 text-kalshi-accent" />
                  <span className="text-sm font-medium text-gray-900">{formatBalance(balance)}</span>
                </div>

                {/* Account Menu */}
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 bg-kalshi-accent rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-900">{formatAddress(address!)}</span>
                </div>

                {/* Disconnect Button */}
                <Button 
                  onClick={disconnect}
                  variant="outline" 
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                {/* Connect Wallet Button */}
                <Button 
                  onClick={connect}
                  className="bg-gray-50 hover:bg-gray-50 border border-black text-black hover:text-black shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all duration-200"
                  size="sm"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export function Navigation() {
  return (
    <Suspense fallback={<div className="h-16 bg-gray-50 border-b border-gray-200" />}>
      <NavigationContent />
    </Suspense>
  )
} 