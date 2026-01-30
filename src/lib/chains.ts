import { base, optimism, mainnet, arbitrum } from 'wagmi/chains'

/**
 * Supported EVM chains for attestations.
 * Each chain has its own signature verification context.
 */
export const SUPPORTED_CHAINS = [base, optimism, mainnet, arbitrum] as const

export type SupportedChainId = typeof SUPPORTED_CHAINS[number]['id']

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = [mainnet.id, base.id, optimism.id, arbitrum.id]

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

/**
 * Sort chain IDs with Ethereum (mainnet) always first, then by SUPPORTED_CHAIN_IDS order.
 */
export function sortChainIds(chainIds: number[]): number[] {
  return [...chainIds].sort((a, b) => {
    const indexA = SUPPORTED_CHAIN_IDS.indexOf(a as SupportedChainId)
    const indexB = SUPPORTED_CHAIN_IDS.indexOf(b as SupportedChainId)
    // Unknown chains go to the end
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    return orderA - orderB
  })
}

/**
 * Sort items by chainId with Ethereum first.
 */
export function sortByChainId<T extends { chainId: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const indexA = SUPPORTED_CHAIN_IDS.indexOf(a.chainId as SupportedChainId)
    const indexB = SUPPORTED_CHAIN_IDS.indexOf(b.chainId as SupportedChainId)
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    return orderA - orderB
  })
}
