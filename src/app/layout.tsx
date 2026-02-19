import type { Metadata } from 'next'
import { Geist, Geist_Mono, Syne, Outfit } from 'next/font/google'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth'
import { WagmiProvider } from '@/providers/WagmiProvider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const syne = Syne({ variable: '--font-syne', subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })
const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Identity Link',
  description: 'Link your ATProto DID to your Ethereum wallet. Create verifiable connections between your decentralized identity and blockchain address.',
  metadataBase: new URL('https://link.piss.beauty'),
  openGraph: {
    title: 'Identity Link',
    description: 'Link your ATProto DID to your Ethereum wallet. Create verifiable connections between your decentralized identity and blockchain address.',
    url: 'https://link.piss.beauty',
    siteName: 'Identity Link',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Identity Link — Bridge ATProto and Ethereum identities',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Identity Link',
    description: 'Link your ATProto DID to your Ethereum wallet.',
    images: ['/og-image.png'],
    creator: '@gainforest',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${outfit.variable} antialiased`}
      >
        <ThemeProvider>
          <WagmiProvider>
            <AuthProvider>
              <div className="relative min-h-screen noise-bg flex flex-col">
                <div className="gradient-mesh absolute inset-0 -z-10" />
                <div className="relative z-10 flex-1 flex flex-col">
                  <Header />
                  <main className="relative flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-8">
                    {children}
                  </main>
                  <footer className="relative py-6 mt-auto">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-2">
                      <Image src="/hypercerts_logo.png" alt="Hypercerts" width={12} height={12} />
                      <span className="text-[11px] font-[family-name:var(--font-outfit)] text-muted-foreground tracking-wide">
                        Member of Hypercerts &amp; ATProto ecosystem
                      </span>
                    </div>
                  </footer>
                </div>
              </div>
            </AuthProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
