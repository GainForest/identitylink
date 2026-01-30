import { base, optimism, mainnet, arbitrum } from 'wagmi/chains'

/**
 * Supported EVM chains for attestations.
 * Each chain has its own signature verification context.
 */
export const SUPPORTED_CHAINS = [base, optimism, mainnet, arbitrum] as const

export type SupportedChainId = typeof SUPPORTED_CHAINS[number]['id']

export const CHAIN_NAMES: Record<SupportedChainId, string> = {
  [base.id]: 'Base',
  [optimism.id]: 'Optimism',
  [mainnet.id]: 'Ethereum',
  [arbitrum.id]: 'Arbitrum',
}

export const CHAIN_COLORS: Record<SupportedChainId, string> = {
  [base.id]: '#0052FF',      // Coinbase blue
  [optimism.id]: '#FF0420',  // Optimism red
  [mainnet.id]: '#627EEA',   // Ethereum purple
  [arbitrum.id]: '#12AAFF',  // Arbitrum blue
}

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId as SupportedChainId] || `Chain ${chainId}`
}

export function isSupported(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAINS.some(chain => chain.id === chainId)
}

export function getExplorerUrl(chainId: number, address: string): string {
  const explorers: Record<SupportedChainId, string> = {
    [mainnet.id]: 'https://etherscan.io',
    [base.id]: 'https://basescan.org',
    [optimism.id]: 'https://optimistic.etherscan.io',
    [arbitrum.id]: 'https://arbiscan.io',
  }
  const baseUrl = explorers[chainId as SupportedChainId] || 'https://etherscan.io'
  return `${baseUrl}/address/${address}`
}
