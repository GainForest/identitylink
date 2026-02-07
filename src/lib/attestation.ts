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
 * ATProto collection NSID for EVM address attestations.
 * Lexicon defined at: @gainforest-lexicons/lexicons/org/impactindexer/link/attestation.json
 */
export const ATTESTATION_COLLECTION = 'org.impactindexer.link.attestation'

/**
 * Stored attestation record format for PDS.
 */
export interface StoredAttestation {
  $type: typeof ATTESTATION_COLLECTION
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

/**
 * ATProto collection NSID for social profile links.
 * Lexicon: org.impactindexer.link.social
 */
export const SOCIAL_COLLECTION = 'org.impactindexer.link.social'

/**
 * Supported social platforms.
 */
export type SocialPlatform =
  | 'twitter'
  | 'github'
  | 'instagram'
  | 'telegram'
  | 'discord'
  | 'linkedin'
  | 'website'

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; placeholder: string; urlPrefix?: string }[] = [
  { id: 'twitter', label: 'X / Twitter', placeholder: 'username', urlPrefix: 'https://x.com/' },
  { id: 'github', label: 'GitHub', placeholder: 'username', urlPrefix: 'https://github.com/' },
  { id: 'instagram', label: 'Instagram', placeholder: 'username', urlPrefix: 'https://instagram.com/' },
  { id: 'telegram', label: 'Telegram', placeholder: 'username', urlPrefix: 'https://t.me/' },
  { id: 'discord', label: 'Discord', placeholder: 'username#0000 or username' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'username', urlPrefix: 'https://linkedin.com/in/' },
  { id: 'website', label: 'Website', placeholder: 'https://example.com' },
]

/**
 * Stored social link record format for PDS.
 */
export interface StoredSocialLink {
  $type: typeof SOCIAL_COLLECTION
  platform: SocialPlatform
  handle: string
  url?: string
  verified?: boolean
  verifiedAt?: string
  createdAt: string
}

/**
 * Platforms that support automatic bio verification.
 */
export const VERIFIABLE_PLATFORMS: SocialPlatform[] = ['github', 'twitter', 'instagram', 'website']
