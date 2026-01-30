import { Agent } from '@atproto/api'
import type { Hex } from 'viem'
import {
  ATTESTATION_COLLECTION,
  type StoredAttestation,
  type SignatureType,
} from './attestation'

/**
 * Store an attestation in the user's ATProto PDS.
 * 
 * The attestation is stored as a record in the user's repository
 * under the xyz.atproto.evm.addressAttestation collection.
 */
export async function storeAttestation(
  agent: Agent,
  did: string,
  params: {
    address: string
    chainId: number
    signature: Hex
    message: StoredAttestation['message']
    signatureType: SignatureType
  }
): Promise<{ uri: string; cid: string }> {
  if (!did) {
    throw new Error('DID is required')
  }

  const record: StoredAttestation = {
    $type: ATTESTATION_COLLECTION,
    address: params.address,
    chainId: params.chainId,
    signature: params.signature,
    message: params.message,
    signatureType: params.signatureType,
    createdAt: new Date().toISOString(),
  }

  // Generate a record key based on address and chainId
  // This allows updating existing attestations for the same address/chain
  const rkey = `${params.address.toLowerCase()}-${params.chainId}`

  const response = await agent.com.atproto.repo.putRecord({
    repo: did,
    collection: ATTESTATION_COLLECTION,
    rkey,
    record: record as unknown as Record<string, unknown>,
  })

  return {
    uri: response.data.uri,
    cid: response.data.cid,
  }
}

export interface AttestationWithKey extends StoredAttestation {
  rkey: string
}

/**
 * Get all attestations for a given DID from their PDS.
 */
export async function getAttestations(
  did: string
): Promise<AttestationWithKey[]> {
  // Create an unauthenticated agent for public reads
  const agent = new Agent({ service: 'https://bsky.social' })

  try {
    const response = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: ATTESTATION_COLLECTION,
    })

    return response.data.records.map(r => {
      // Extract rkey from URI: at://did:plc:xxx/collection/rkey
      const uri = r.uri
      const rkey = uri.split('/').pop() || ''
      return {
        ...(r.value as unknown as StoredAttestation),
        rkey,
      }
    })
  } catch (error) {
    // If collection doesn't exist or repo not found, return empty array
    console.warn('Failed to fetch attestations:', error)
    return []
  }
}

/**
 * Get a specific attestation by DID and record key.
 */
export async function getAttestation(
  did: string,
  rkey: string
): Promise<StoredAttestation | null> {
  const agent = new Agent({ service: 'https://bsky.social' })

  try {
    const response = await agent.com.atproto.repo.getRecord({
      repo: did,
      collection: ATTESTATION_COLLECTION,
      rkey,
    })

    return response.data.value as unknown as StoredAttestation
  } catch {
    return null
  }
}

/**
 * Delete an attestation from the user's PDS.
 */
export async function deleteAttestation(
  agent: Agent,
  did: string,
  rkey: string
): Promise<void> {
  if (!did) {
    throw new Error('DID is required')
  }

  await agent.com.atproto.repo.deleteRecord({
    repo: did,
    collection: ATTESTATION_COLLECTION,
    rkey,
  })
}

/**
 * Resolve a Bluesky handle to a DID.
 */
export async function resolveHandleToDid(handle: string): Promise<string | null> {
  const agent = new Agent({ service: 'https://bsky.social' })

  try {
    const response = await agent.resolveHandle({ handle })
    return response.data.did
  } catch {
    return null
  }
}
