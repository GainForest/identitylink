import type { Metadata } from 'next'
import { Inter, EB_Garamond } from 'next/font/google'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { GeometricBackground } from '@/components/GeometricBackground'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth'
import { WagmiProvider } from '@/providers/WagmiProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const garamond = EB_Garamond({
  variable: '--font-garamond',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

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
        url: '/og-image.jpg',
        width: 2800,
        height: 1800,
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
    images: ['/og-image.jpg'],
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
        className={`${inter.variable} ${garamond.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100`}
      >
        <ThemeProvider>
          <WagmiProvider>
            <AuthProvider>
              <div className="relative min-h-screen overflow-hidden flex flex-col">
              {/* Geometric flow background */}
              <div className="hidden lg:block">
                <GeometricBackground />
              </div>

              <Header />

              {/* Body */}
              <main className="relative flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pb-8">
                {children}
              </main>

              {/* Footer */}
              <footer className="relative py-6 mt-auto">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-2">
                  <Image
                    src="/hypercerts_logo.png"
                    alt="Hypercerts"
                    width={12}
                    height={12}
                  />
                  <span className="text-[11px] text-zinc-300 dark:text-zinc-600 tracking-wide">
                    Member of Hypercerts &amp; ATProto ecosystem
                  </span>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
