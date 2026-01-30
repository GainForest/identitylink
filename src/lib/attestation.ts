import type { Address, Hex } from 'viem'

/**
 * EIP-712 Typed Data for ATProto-EVM attestations.
 * 
 * This structured format ensures:
 * 1. Human-readable signing in wallets
 * 2. Replay protection via chainId and nonce
 * 3. Timestamp for freshness verification
 */

export const ATTESTATION_TYPES = {
  Attestation: [
    { name: 'did', type: 'string' },
    { name: 'evmAddress', type: 'address' },
    { name: 'chainId', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const

export interface AttestationMessage {
  did: string
  evmAddress: Address
  chainId: bigint
  timestamp: bigint
  nonce: bigint
}

export interface AttestationDomain {
  name: string
  version: string
  chainId?: number
}

/**
 * Create the EIP-712 domain separator.
 * Note: chainId is included in the message, not the domain,
 * to allow cross-chain verification of the same attestation.
 */
export function createAttestationDomain(): AttestationDomain {
  return {
    name: 'ATProto EVM Attestation',
    version: '1',
  }
}

/**
 * Create an attestation message to be signed.
 */
export function createAttestationMessage(params: {
  did: string
  address: Address
  chainId: number
  timestamp?: number
  nonce?: number
}): AttestationMessage {
  return {
    did: params.did,
    evmAddress: params.address,
    chainId: BigInt(params.chainId),
    timestamp: BigInt(params.timestamp ?? Math.floor(Date.now() / 1000)),
    nonce: BigInt(params.nonce ?? 1),
  }
}

/**
 * Signature types supported for verification.
 */
export type SignatureType = 'eoa' | 'erc1271' | 'erc6492'

/**
 * Stored attestation record format for PDS.
 */
export interface StoredAttestation {
  $type: 'xyz.atproto.evm.addressAttestation'
  address: string
  chainId: number
  signature: Hex
  message: {
    did: string
    evmAddress: string
    chainId: string
    timestamp: string
    nonce: string
  }
  signatureType: SignatureType
  createdAt: string
}

/**
 * ATProto collection NSID for EVM address attestations.
 */
export const ATTESTATION_COLLECTION = 'xyz.atproto.evm.addressAttestation'

/**
 * Convert an attestation message to storage format.
 */
export function messageToStorageFormat(message: AttestationMessage): StoredAttestation['message'] {
  return {
    did: message.did,
    evmAddress: message.evmAddress,
    chainId: message.chainId.toString(),
    timestamp: message.timestamp.toString(),
    nonce: message.nonce.toString(),
  }
}

/**
 * Convert stored message back to attestation message format.
 */
export function storageFormatToMessage(stored: StoredAttestation['message']): AttestationMessage {
  return {
    did: stored.did,
    evmAddress: stored.evmAddress as Address,
    chainId: BigInt(stored.chainId),
    timestamp: BigInt(stored.timestamp),
    nonce: BigInt(stored.nonce),
  }
}
