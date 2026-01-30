import { NextRequest, NextResponse } from 'next/server'
import { getAttestations, resolveHandleToDid } from '@/lib/pds'

export const dynamic = 'force-dynamic'

/**
 * GET /api/attestations/[did]
 * Fetch all attestations for a DID or handle.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ did: string }> }
) {
  try {
    let { did } = await params

    // Handle both handles and DIDs
    if (!did.startsWith('did:')) {
      // It's a handle - resolve to DID
      const resolvedDid = await resolveHandleToDid(did)
      if (!resolvedDid) {
        return NextResponse.json({ error: 'Handle not found' }, { status: 404 })
      }
      did = resolvedDid
    }

    // Fetch attestations from the user's PDS
    const attestations = await getAttestations(did)

    return NextResponse.json({
      did,
      attestations,
      count: attestations.length,
    })
  } catch (error) {
    console.error('Failed to fetch attestations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attestations' },
      { status: 500 }
    )
  }
}
