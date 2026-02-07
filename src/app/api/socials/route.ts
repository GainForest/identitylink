import { NextRequest, NextResponse } from 'next/server'
import { Agent } from '@atproto/api'
import { getGlobalOAuthClient } from '@/lib/auth/client'
import { getSession } from '@/lib/session'
import { storeSocialLink } from '@/lib/pds'
import { SOCIAL_PLATFORMS, type SocialPlatform } from '@/lib/attestation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/socials
 * Store a new social link in the authenticated user's PDS.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.did) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, handle, url } = body as {
      platform: SocialPlatform
      handle: string
      url?: string
    }

    if (!platform || !handle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate platform
    const validPlatform = SOCIAL_PLATFORMS.find(p => p.id === platform)
    if (!validPlatform) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    const oauthClient = await getGlobalOAuthClient()
    const oauthSession = await oauthClient.restore(session.did)

    if (!oauthSession) {
      return NextResponse.json({ error: 'OAuth session expired' }, { status: 401 })
    }

    const agent = new Agent(oauthSession)

    const result = await storeSocialLink(agent, session.did, {
      platform,
      handle: handle.trim(),
      url: url?.trim() || undefined,
    })

    return NextResponse.json({
      success: true,
      uri: result.uri,
      cid: result.cid,
    })
  } catch (error) {
    console.error('Failed to store social link:', error)
    return NextResponse.json(
      { error: 'Failed to store social link' },
      { status: 500 }
    )
  }
}
