import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function GET() {
  const publicUrl = env.PUBLIC_URL

  if (!publicUrl) {
    return NextResponse.json(
      { error: 'PUBLIC_URL not configured' },
      { status: 500 }
    )
  }

  const metadata = {
    client_id: `${publicUrl}/api/oauth/client-metadata.json`,
    client_name: 'ATProto-EVM Link',
    client_uri: publicUrl,
    logo_uri: `${publicUrl}/logo.svg`,
    redirect_uris: [`${publicUrl}/api/oauth/callback`],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'ES256',
    jwks_uri: `${publicUrl}/api/oauth/jwks.json`,
    application_type: 'web',
    dpop_bound_access_tokens: true,
  }

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
