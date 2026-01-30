import { NextResponse } from 'next/server'
import { getJwks } from '@/lib/auth/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const jwks = await getJwks()

    if (!jwks) {
      // No keyset configured - return empty JWKS
      return NextResponse.json({ keys: [] }, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    return NextResponse.json(jwks, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Failed to get JWKS:', error)
    return NextResponse.json(
      { error: 'Failed to get JWKS' },
      { status: 500 }
    )
  }
}
