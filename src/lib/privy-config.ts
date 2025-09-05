// Privy App ID - get from https://dashboard.privy.io
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmeogej7o00c0l50buxmqjku4'

// Privy configuration
export const privyConfig = {
  // Appearance customization
  appearance: {
    theme: 'light' as const,
    accentColor: '#acf3e1',
    logo: '/HYPIQ-logo-black.png',
    walletList: ['metamask', 'okx_wallet', 'rabby_wallet'], // Only show these wallets
    loginMethods: ['wallet'], // Only allow wallet login, no email/social
    showWalletLoginFirst: true,
  },
  
  // Login methods - disable email and social logins
  loginMethods: ['wallet'],
  
  // Disable email and social authentication
  email: {
    enabled: false,
  },
  
  sms: {
    enabled: false,
  },
  
  // Embedded wallet config (disable since we only want external wallets)
  embeddedWallets: {
    createOnLogin: 'off' as const, // Don't create embedded wallets
  },

  // Disable analytics to prevent GTM loading
  analytics: {
    enabled: false,
  },
  
  // Legal terms
  legal: {
    termsAndConditionsUrl: 'https://hypiq.com/terms',
    privacyPolicyUrl: 'https://hypiq.com/privacy',
  },
}

// Wallet connector configurations
export const walletConnectors = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    iconUrl: 'https://wallet-api-production.s3.amazonaws.com/uploads/1676403550/metamask.png',
  },
  okx_wallet: {
    id: 'okx_wallet', 
    name: 'OKX Wallet',
    iconUrl: 'https://wallet-api-production.s3.amazonaws.com/uploads/1676403550/okx.png',
  },
  rabby_wallet: {
    id: 'rabby_wallet',
    name: 'Rabby Wallet', 
    iconUrl: 'https://wallet-api-production.s3.amazonaws.com/uploads/1676403550/rabby.png',
  },
}
