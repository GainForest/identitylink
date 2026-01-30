import { generateOGImage, size, contentType } from '@/lib/og/generate-og-image'

export { size, contentType }
export const runtime = 'edge'

export default async function OGImage() {
  return generateOGImage({
    title: 'IdentityLink',
    subtitle: 'Link your ATProto DID to Ethereum wallets with cryptographic proof',
  })
}
