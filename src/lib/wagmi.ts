import { createConfig, http } from 'wagmi'
import { base, optimism, mainnet, arbitrum } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected, safe } from 'wagmi/connectors'

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''

// Build RPC URLs with optional Alchemy key
const getRpcUrl = (chain: string, publicUrl: string) => {
  if (ALCHEMY_API_KEY) {
    return `https://${chain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  }
  return publicUrl
}

export const wagmiConfig = createConfig({
  chains: [base, optimism, mainnet, arbitrum],

  connectors: [
    // Coinbase Smart Wallet - prioritize for passkey UX
    coinbaseWallet({
      appName: 'ATProto-EVM Link',
      // Prefer smart wallet mode (passkeys) when available
      preference: 'smartWalletOnly',
    }),

    // WalletConnect for mobile wallets
    ...(WALLETCONNECT_PROJECT_ID ? [
      walletConnect({
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'ATProto-EVM Link',
          description: 'Link your ATProto identity to your Ethereum wallet',
          url: 'https://link.piss.beauty',
          icons: ['https://link.piss.beauty/logo.svg'],
        },
      }),
    ] : []),

    // Safe multisig support
    safe(),

    // Browser extension wallets (MetaMask, etc.)
    injected(),
  ],

  transports: {
    [base.id]: http(getRpcUrl('base-mainnet', 'https://mainnet.base.org')),
    [optimism.id]: http(getRpcUrl('opt-mainnet', 'https://mainnet.optimism.io')),
    [mainnet.id]: http(getRpcUrl('eth-mainnet', 'https://eth.llamarpc.com')),
    [arbitrum.id]: http(getRpcUrl('arb-mainnet', 'https://arb1.arbitrum.io/rpc')),
  },
})
