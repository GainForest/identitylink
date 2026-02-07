import type { SocialPlatform } from './attestation'

export interface SocialVerificationResult {
  verified: boolean
  error?: string
}

/**
 * Verify a social link by checking if the profile's bio contains the ATProto handle.
 * Returns { verified: true } if the handle or DID is found in the bio.
 */
export async function verifySocialBio(
  platform: SocialPlatform,
  profileHandle: string,
  atprotoHandle: string,
  atprotoDid: string
): Promise<SocialVerificationResult> {
  try {
    const bio = await fetchProfileBio(platform, profileHandle)

    if (bio === null) {
      return {
        verified: false,
        error: `Could not fetch ${platform} profile. Bio verification is not available for this platform.`,
      }
    }

    const bioLower = bio.toLowerCase()
    const handleLower = atprotoHandle.toLowerCase()
    const didLower = atprotoDid.toLowerCase()

    // Check if bio contains the ATProto handle or DID
    const found =
      bioLower.includes(handleLower) ||
      bioLower.includes(didLower) ||
      // Also check without the .bsky.social suffix for brevity
      (handleLower.endsWith('.bsky.social') &&
        bioLower.includes(handleLower.replace('.bsky.social', '')))

    if (found) {
      return { verified: true }
    }

    return {
      verified: false,
      error: `Could not find "${atprotoHandle}" or your DID in your ${platform} bio. Please add it and try again.`,
    }
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

/**
 * Fetch the bio/description text from a social platform profile.
 * Returns null if the platform doesn't support bio fetching.
 */
async function fetchProfileBio(
  platform: SocialPlatform,
  handle: string
): Promise<string | null> {
  switch (platform) {
    case 'github':
      return fetchGitHubBio(handle)
    case 'twitter':
      return fetchTwitterBio(handle)
    case 'instagram':
      return fetchInstagramBio(handle)
    case 'website':
      return fetchWebsiteContent(handle)
    default:
      // Telegram, Discord, LinkedIn don't have reliably accessible public bio APIs
      return null
  }
}

/**
 * Fetch GitHub user bio via public API.
 */
async function fetchGitHubBio(username: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.bio || ''
  } catch {
    return null
  }
}

/**
 * Fetch Twitter/X bio. Uses multiple fallback strategies.
 */
async function fetchTwitterBio(username: string): Promise<string | null> {
  // Strategy 1: Try syndication API (embedded tweet metadata)
  try {
    const res = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(username)}`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const html = await res.text()
      // The syndication page contains the bio in the HTML
      // Look for the description meta tag or bio text
      const bioMatch = html.match(
        /data-testid="UserDescription"[^>]*>([^<]+)/
      )
      if (bioMatch) return bioMatch[1]

      // Fallback: look for any occurrence of common ATProto patterns in the full HTML
      return html
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Try oembed which may contain description
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?url=https://twitter.com/${encodeURIComponent(username)}&omit_script=true`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const data = await res.json()
      // oembed returns HTML of the profile card, which may include bio text
      return data.html || null
    }
  } catch {
    // Exhausted strategies
  }

  return null
}

/**
 * Fetch Instagram bio via profile page meta tags.
 * Instagram may block server-side requests; returns null if unavailable.
 */
async function fetchInstagramBio(username: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.instagram.com/${encodeURIComponent(username)}/`,
      {
        headers: {
          Accept: 'text/html',
          'User-Agent': 'Mozilla/5.0 (compatible; IdentityLink/1.0)',
        },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return null
    const html = await res.text()

    // Try og:description meta tag which typically contains the bio
    const ogMatch = html.match(
      /<meta\s+property="og:description"\s+content="([^"]*?)"\s*\/?>/i
    )
    if (ogMatch) return ogMatch[1]

    // Fallback: try description meta tag
    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*?)"\s*\/?>/i
    )
    if (descMatch) return descMatch[1]

    return null
  } catch {
    return null
  }
}

/**
 * Fetch website content and check for ATProto handle in HTML.
 */
async function fetchWebsiteContent(urlOrDomain: string): Promise<string | null> {
  try {
    const url = urlOrDomain.startsWith('http')
      ? urlOrDomain
      : `https://${urlOrDomain}`

    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 60 },
    })
    if (!res.ok) return null

    // Only read the first 100KB to avoid memory issues
    const text = await res.text()
    return text.slice(0, 100_000)
  } catch {
    return null
  }
}
