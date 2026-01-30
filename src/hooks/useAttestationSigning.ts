'use client'

import { useState, useCallback } from 'react'
import { useSignTypedData, useAccount, useChainId } from 'wagmi'
import type { Address, Hex } from 'viem'
import {
  createAttestationMessage,
  createAttestationDomain,
  ATTESTATION_TYPES,
  messageToStorageFormat,
  type AttestationMessage,
  type SignatureType,
} from '@/lib/attestation'
import { useWalletType } from './useWalletType'

export interface SignedAttestation {
  message: AttestationMessage
  messageForStorage: ReturnType<typeof messageToStorageFormat>
  signature: Hex
  signatureType: SignatureType
  address: Address
  chainId: number
}

export interface UseAttestationSigningResult {
  signAttestation: (did: string) => Promise<SignedAttestation>
  isPending: boolean
  error: Error | null
  walletType: ReturnType<typeof useWalletType>['walletType']
}

/**
 * Hook for signing EIP-712 attestations linking an ATProto DID to an EVM address.
 * 
 * Handles both EOA and smart wallet signatures:
 * - EOA: Standard ECDSA signature
 * - Smart Wallet: ERC-1271 compatible signature (Coinbase, Safe, etc.)
 */
export function useAttestationSigning(): UseAttestationSigningResult {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signTypedDataAsync } = useSignTypedData()
  const { walletType } = useWalletType()
  
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signAttestation = useCallback(async (did: string): Promise<SignedAttestation> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    setIsPending(true)
    setError(null)

    try {
      // Create the attestation message
      const message = createAttestationMessage({
        did,
        address,
        chainId,
      })

      // Create the domain
      const domain = createAttestationDomain()

      // Request signature from wallet
      // For passkey wallets, this triggers biometric prompt
      // For other wallets, this opens the wallet UI
      const signature = await signTypedDataAsync({
        domain,
        types: ATTESTATION_TYPES,
        primaryType: 'Attestation',
        message: {
          did: message.did,
          evmAddress: message.evmAddress,
          chainId: message.chainId,
          timestamp: message.timestamp,
          nonce: message.nonce,
        },
      })

      // Determine signature type based on wallet type
      const signatureType: SignatureType = walletType === 'smart-wallet' ? 'erc1271' : 'eoa'

      return {
        message,
        messageForStorage: messageToStorageFormat(message),
        signature,
        signatureType,
        address,
        chainId,
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Signing failed')
      setError(error)
      throw error
    } finally {
      setIsPending(false)
    }
  }, [address, chainId, signTypedDataAsync, walletType])

  return {
    signAttestation,
    isPending,
    error,
    walletType,
  }
}
