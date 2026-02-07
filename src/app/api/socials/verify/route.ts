import { NextRequest, NextResponse } from 'next/server'
import { Agent } from '@atproto/api'
import { getGlobalOAuthClient } from '@/lib/auth/client'
import { getSession } from '@/lib/session'
import { storeSocialLink } from '@/lib/pds'
import { verifySocialBio } from '@/lib/social-verify'
import { VERIFIABLE_PLATFORMS, type SocialPlatform } from '@/lib/attestation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/socials/verify
 * Verify a social link by checking the profile bio for the ATProto handle.
 * If verified, updates the PDS record with verified=true.
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

    if (!VERIFIABLE_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `Automatic verification is not available for ${platform}. Only GitHub, Twitter/X, and websites support bio verification.` },
        { status: 400 }
      )
    }

    const atprotoHandle = session.handle || ''
    const result = await verifySocialBio(platform, handle, atprotoHandle, session.did)

    if (!result.verified) {
      return NextResponse.json({
        verified: false,
        error: result.error,
      })
    }

    // Verification passed - update the PDS record with verified status
    const oauthClient = await getGlobalOAuthClient()
    const oauthSession = await oauthClient.restore(session.did)

    if (!oauthSession) {
      return NextResponse.json({ error: 'OAuth session expired' }, { status: 401 })
    }

    const agent = new Agent(oauthSession)

    // Re-store the social link with verified flag
    await storeSocialLink(agent, session.did, {
      platform,
      handle: handle.trim(),
      url: url?.trim() || undefined,
      verified: true,
      verifiedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      verified: true,
    })
  } catch (error) {
    console.error('Social verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
