import { NextRequest, NextResponse } from 'next/server'
import { getGlobalOAuthClient } from '@/lib/auth/client'
import { getSession } from '@/lib/session'
import { SOCIAL_COLLECTION } from '@/lib/attestation'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/socials/[did]/[rkey]
 * Delete a social link.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ did: string; rkey: string }> }
) {
  try {
    const { did, rkey } = await params
    const session = await getSession()

    if (!session.did) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (session.did !== did) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await getGlobalOAuthClient()
    const oauthSession = await client.restore(did)

    if (!oauthSession) {
      return NextResponse.json(
        { error: 'OAuth session expired. Please sign in again.' },
        { status: 401 }
      )
    }

    const { Agent } = await import('@atproto/api')
    const agent = new Agent(oauthSession)

    await agent.com.atproto.repo.deleteRecord({
      repo: did,
      collection: SOCIAL_COLLECTION,
      rkey: decodeURIComponent(rkey),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete social link error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete social link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
