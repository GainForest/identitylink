import type { Metadata } from 'next'
import { Inter, EB_Garamond } from 'next/font/google'
import { Header } from '@/components/Header'
import { GeometricBackground } from '@/components/GeometricBackground'
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
  title: 'ATProto-EVM Link',
  description: 'Link your Bluesky identity to your Ethereum wallet. Create verifiable connections between your social identity and blockchain address.',
  metadataBase: new URL('https://link.piss.beauty'),
  openGraph: {
    title: 'ATProto-EVM Link',
    description: 'Link your Bluesky identity to your Ethereum wallet. Create verifiable connections between your social identity and blockchain address.',
    url: 'https://link.piss.beauty',
    siteName: 'ATProto-EVM Link',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATProto-EVM Link',
    description: 'Link your Bluesky identity to your Ethereum wallet.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${garamond.variable} antialiased bg-white text-zinc-800`}
      >
        <WagmiProvider>
          <AuthProvider>
            <div className="relative min-h-screen overflow-hidden flex flex-col">
              {/* Geometric flow background */}
              <div className="hidden lg:block">
                <GeometricBackground />
              </div>

              <Header />

              {/* Body */}
              <main className="relative flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 pb-8">
                {children}
              </main>

              {/* Footer */}
              <footer className="relative py-6 mt-auto">
                <div className="max-w-xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <span className="text-[11px] text-zinc-300 tracking-wide">
                    Bridge between ATProto &amp; Ethereum
                  </span>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
