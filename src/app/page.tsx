'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorBanner() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  if (!error) return null
  
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
      <p className="text-sm text-red-700">
        <span className="font-medium">Authentication failed:</span> {error}
      </p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="pt-16 sm:pt-24 pb-16">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>
      
      {/* Hero */}
      <div className="max-w-lg">
        <h1 className="font-[family-name:var(--font-garamond)] text-3xl sm:text-4xl text-zinc-900 leading-tight">
          Bridge Your Identities
        </h1>
        <p className="text-zinc-500 mt-4 text-base leading-relaxed">
          Link your ATProto DID to your Ethereum wallet with cryptographic proof.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/link"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
                     bg-emerald-600 text-white font-medium rounded-lg
                     hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Link Identity
        </Link>
        <Link
          href="/verify"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
                     bg-white text-zinc-700 font-medium rounded-lg border border-zinc-200
                     hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verify
        </Link>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-6">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Step number={1} title="Sign in" description="Authenticate with your ATProto handle" />
          <Step number={2} title="Connect" description="Link your Ethereum wallet" />
          <Step number={3} title="Sign" description="Create a cryptographic attestation" />
          <Step number={4} title="Share" description="Anyone can verify the link" />
        </div>
      </div>

      {/* Features */}
      <div className="mt-16">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-6">
          Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Feature title="Self-sovereign" description="Data stored in your ATProto PDS" />
          <Feature title="Multi-chain" description="Ethereum, Base, Optimism, Arbitrum" />
          <Feature title="Any wallet" description="MetaMask, Coinbase, Safe, and more" />
          <Feature title="Verifiable" description="EIP-712 cryptographic signatures" />
        </div>
      </div>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium 
                      flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="font-medium text-zinc-800">{title}</h3>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <div>
        <span className="text-sm text-zinc-700">{title}</span>
        <span className="text-sm text-zinc-400"> — {description}</span>
      </div>
    </div>
  )
}
