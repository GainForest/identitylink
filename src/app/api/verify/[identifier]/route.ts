import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, optimism, mainnet, arbitrum } from 'wagmi/chains'
import { getAttestations, resolveHandleToDid } from '@/lib/pds'
import { verifyAttestation } from '@/lib/verify'
import type { StoredAttestation, SignatureType } from '@/lib/attestation'

export const dynamic = 'force-dynamic'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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
    let displayName: string | undefined
    let avatar: string | undefined
    let pds: string | undefined

    if (identifier.startsWith('did:')) {
      did = identifier
    } else {
      // It's a handle
      handle = identifier
      const resolvedDid = await resolveHandleToDid(identifier)
      if (!resolvedDid) {
        return NextResponse.json({ error: 'Handle not found' }, { status: 404, headers: corsHeaders })
      }
      did = resolvedDid
    }

    // Fetch profile info
    try {
      const profileUrl = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`
      const profileRes = await fetch(profileUrl, { next: { revalidate: 3600 } })
      if (profileRes.ok) {
        const profile = await profileRes.json()
        handle = handle || profile.handle
        displayName = profile.displayName
        avatar = profile.avatar
      }
    } catch {
      // Silently continue without profile info
    }

    // Resolve PDS
    try {
      const plcUrl = `https://plc.directory/${encodeURIComponent(did)}`
      const plcRes = await fetch(plcUrl, { next: { revalidate: 3600 } })
      if (plcRes.ok) {
        const plcDoc = await plcRes.json()
        const pdsService = plcDoc.service?.find((s: { type: string }) => s.type === 'AtprotoPersonalDataServer')
        if (pdsService?.serviceEndpoint) {
          pds = new URL(pdsService.serviceEndpoint).hostname
        }
      }
    } catch {
      // Silently continue without PDS info
    }

    // Fetch attestations from PDS
    const attestations = await getAttestations(did)

    if (attestations.length === 0) {
      return NextResponse.json({
        did,
        handle,
        displayName,
        avatar,
        pds,
        attestations: [],
        verified: true,
        verifiedAt: new Date().toISOString(),
        message: 'No attestations found for this identity',
      }, { headers: corsHeaders })
    }

    // Verify each attestation
    const verifiedAttestations: VerifiedAttestation[] = await Promise.all(
      attestations.map(async (attestation) => {
        // Check 1: message.did must match the DID we're looking up
        // This prevents copying someone else's attestation to your PDS
        if (attestation.message.did !== did) {
          return {
            ...attestation,
            verified: false,
            verifiedSignatureType: attestation.signatureType,
            verificationError: `DID mismatch: message claims ${attestation.message.did} but record is in ${did}`,
          }
        }

        // Check 2: message.evmAddress must match attestation.address
        // This ensures internal consistency of the record
        if (attestation.message.evmAddress.toLowerCase() !== attestation.address.toLowerCase()) {
          return {
            ...attestation,
            verified: false,
            verifiedSignatureType: attestation.signatureType,
            verificationError: `Address mismatch: message claims ${attestation.message.evmAddress} but record says ${attestation.address}`,
          }
        }

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
      displayName,
      avatar,
      pds,
      attestations: verifiedAttestations,
      verified: allValid,
      verifiedAt: new Date().toISOString(),
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: String(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}
