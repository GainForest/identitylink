import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, optimism, mainnet, arbitrum } from 'wagmi/chains'
import { getAttestations, resolveHandleToDid } from '@/lib/pds'
import { verifyAttestation } from '@/lib/verify'
import type { StoredAttestation, SignatureType } from '@/lib/attestation'

export const dynamic = 'force-dynamic'

// Create public clients for each supported chain
const clients = {
  [base.id]: createPublicClient({ chain: base, transport: http() }),
  [optimism.id]: createPublicClient({ chain: optimism, transport: http() }),
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http() }),
  [arbitrum.id]: createPublicClient({ chain: arbitrum, transport: http() }),
}

interface VerifiedAttestation extends StoredAttestation {
  verified: boolean
  verifiedSignatureType: SignatureType
  verificationError?: string
}

/**
 * GET /api/verify/[identifier]
 * Verify all attestations for a DID or handle.
 * 
 * The identifier can be:
 * - A DID: did:plc:abc123...
 * - A handle: alice.bsky.social
 * - A handle with @: @alice.bsky.social
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    let { identifier } = await params

    // Clean up identifier
    identifier = identifier.replace(/^@/, '') // Remove leading @

    // Resolve to DID if needed
    let did: string
    let handle: string | undefined

    if (identifier.startsWith('did:')) {
      did = identifier
    } else {
      // It's a handle
      handle = identifier
      const resolvedDid = await resolveHandleToDid(identifier)
      if (!resolvedDid) {
        return NextResponse.json({ error: 'Handle not found' }, { status: 404 })
      }
      did = resolvedDid
    }

    // Fetch attestations from PDS
    const attestations = await getAttestations(did)

    if (attestations.length === 0) {
      return NextResponse.json({
        did,
        handle,
        attestations: [],
        verified: true,
        message: 'No attestations found for this identity',
      })
    }

    // Verify each attestation
    const verifiedAttestations: VerifiedAttestation[] = await Promise.all(
      attestations.map(async (attestation) => {
        const client = clients[attestation.chainId as keyof typeof clients]

        if (!client) {
          return {
            ...attestation,
            verified: false,
            verifiedSignatureType: attestation.signatureType,
            verificationError: `Unsupported chain: ${attestation.chainId}`,
          }
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await verifyAttestation(client as any, attestation)

          return {
            ...attestation,
            verified: result.valid,
            verifiedSignatureType: result.signerType,
            verificationError: result.error,
          }
        } catch (error) {
          return {
            ...attestation,
            verified: false,
            verifiedSignatureType: attestation.signatureType,
            verificationError: error instanceof Error ? error.message : 'Verification failed',
          }
        }
      })
    )

    // Overall verification status
    const allValid = verifiedAttestations.every(a => a.verified)

    return NextResponse.json({
      did,
      handle,
      attestations: verifiedAttestations,
      verified: allValid,
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: String(error) },
      { status: 500 }
    )
  }
}
