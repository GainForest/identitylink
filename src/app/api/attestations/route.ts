import { NextRequest, NextResponse } from 'next/server'
import { Agent } from '@atproto/api'
import { getGlobalOAuthClient } from '@/lib/auth/client'
import { getSession } from '@/lib/session'
import { storeAttestation } from '@/lib/pds'
import type { SignatureType, StoredAttestation } from '@/lib/attestation'
import type { Hex } from 'viem'

export const dynamic = 'force-dynamic'

/**
 * POST /api/attestations
 * Store a new attestation in the authenticated user's PDS.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session.did) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { address, chainId, signature, message, signatureType } = body as {
      address: string
      chainId: number
      signature: Hex
      message: StoredAttestation['message']
      signatureType: SignatureType
    }

    // Validate required fields
    if (!address || !chainId || !signature || !message || !signatureType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the message DID matches the authenticated user
    if (message.did !== session.did) {
      return NextResponse.json({ error: 'DID mismatch' }, { status: 403 })
    }

    // Get OAuth session and create authenticated agent
    const oauthClient = await getGlobalOAuthClient()
    const oauthSession = await oauthClient.restore(session.did)
    
    if (!oauthSession) {
      return NextResponse.json({ error: 'OAuth session expired' }, { status: 401 })
    }

    const agent = new Agent(oauthSession)

    // Store the attestation
    const result = await storeAttestation(agent, session.did, {
      address,
      chainId,
      signature,
      message,
      signatureType,
    })

    return NextResponse.json({
      success: true,
      uri: result.uri,
      cid: result.cid,
    })
  } catch (error) {
    console.error('Failed to store attestation:', error)
    return NextResponse.json(
      { error: 'Failed to store attestation' },
      { status: 500 }
    )
  }
}
