import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { PrivyWalletProvider } from '@/contexts/PrivyWalletContext'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'HYPIQ - Prediction Markets',
  description: 'Advanced prediction markets platform. Trade on whale positions and crypto outcomes. predict/earn.',
  icons: {
    icon: '/Logo.svg',
    apple: '/Logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>HYPIQ - Prediction Markets</title>
        <meta name="description" content="Advanced prediction markets platform. Trade on whale positions and crypto outcomes. predict/earn." />
        <link rel="icon" href="/Logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/Logo.svg" />
      </head>
      <body className={montserrat.className}>
        <PrivyWalletProvider>
          {children}
        </PrivyWalletProvider>
      </body>
    </html>
  )
} 