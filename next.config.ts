import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow external images from Bluesky CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
      },
    ],
  },
}

export default nextConfig
