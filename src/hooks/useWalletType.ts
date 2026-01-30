'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import type { Address } from 'viem'

export type WalletType = 'eoa' | 'smart-wallet' | 'unknown'

export interface WalletTypeResult {
  walletType: WalletType
  isDetecting: boolean
  error: Error | null
}

/**
 * Detect whether the connected wallet is an EOA or a smart contract wallet.
 * 
 * EOA (Externally Owned Account): Standard wallet with private key
 * Smart Wallet: Contract-based wallet (Safe, Coinbase Smart Wallet, etc.)
 * 
 * This affects signature verification:
 * - EOA: Use ECDSA recovery
 * - Smart Wallet: Use ERC-1271 isValidSignature
 */
export function useWalletType(): WalletTypeResult {
  const { address, isConnected, connector } = useAccount()
  const publicClient = usePublicClient()
  
  const [walletType, setWalletType] = useState<WalletType>('unknown')
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConnected || !address || !publicClient) {
      setWalletType('unknown')
      return
    }

    // Quick heuristic: Coinbase Wallet in smart wallet mode is always a smart wallet
    if (connector?.id === 'coinbaseWalletSDK') {
      // Check if it's using smart wallet (passkey) mode
      // The connector type hints at this
      setWalletType('smart-wallet')
      return
    }

    // Check on-chain for contract code
    const detectType = async () => {
      setIsDetecting(true)
      setError(null)

      try {
        const bytecode = await publicClient.getBytecode({ address: address as Address })
        
        if (!bytecode || bytecode === '0x') {
          setWalletType('eoa')
        } else {
          setWalletType('smart-wallet')
        }
      } catch (err) {
        console.error('Failed to detect wallet type:', err)
        setError(err instanceof Error ? err : new Error('Detection failed'))
        // Default to EOA on error - safer for signature handling
        setWalletType('eoa')
      } finally {
        setIsDetecting(false)
      }
    }

    detectType()
  }, [address, isConnected, publicClient, connector])

  return { walletType, isDetecting, error }
}

/**
 * Get a human-readable label for the wallet type.
 */
export function getWalletTypeLabel(type: WalletType): string {
  switch (type) {
    case 'eoa':
      return 'Standard Wallet'
    case 'smart-wallet':
      return 'Smart Wallet'
    default:
      return 'Unknown'
  }
}
