import { NextRequest, NextResponse } from 'next/server'
import { Agent } from '@atproto/api'
import { isValidHandle } from '@atproto/syntax'

export const dynamic = 'force-dynamic'

const agent = new Agent({ service: 'https://bsky.social' })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')

  if (!handle || !isValidHandle(handle)) {
    return NextResponse.json({ error: 'Invalid handle' }, { status: 400 })
  }

  try {
    const resolved = await agent.resolveHandle({ handle })
    return NextResponse.json({ did: resolved.data.did })
  } catch (error) {
    console.error('Failed to resolve handle:', error)
    return NextResponse.json({ error: 'Handle not found' }, { status: 404 })
  }
}
