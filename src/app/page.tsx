'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Link2, CheckCircle, ArrowRight, Check } from "lucide-react"

function ErrorBanner() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  if (!error) return null
  
  return (
    <div className="mb-6 glass-panel rounded-xl p-4 border border-destructive/30 bg-destructive/5">
      <p className="text-sm font-[family-name:var(--font-outfit)] text-destructive">
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
      <div className="max-w-lg animate-fade-in-up">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl sm:text-4xl lg:text-5xl text-foreground font-bold tracking-tight leading-tight">
          Bridge Your Identities
        </h1>
        <p className="font-[family-name:var(--font-outfit)] text-muted-foreground mt-4 text-base leading-relaxed">
          Link your ATProto DID to your Ethereum wallet with cryptographic proof.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/link"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
            bg-create-accent text-create-accent-foreground font-[family-name:var(--font-outfit)] font-semibold rounded-lg
            hover:bg-create-accent/90 shadow-md transition-all duration-200"
        >
          <Link2 className="size-4" />
          Link Identity
        </Link>
        <Link
          href="/verify"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 
            bg-secondary text-secondary-foreground font-[family-name:var(--font-outfit)] font-medium rounded-lg border border-border
            hover:bg-accent transition-colors"
        >
          <CheckCircle className="size-4" />
          Verify
        </Link>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-sm font-[family-name:var(--font-syne)] font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 stagger-children">
          <Step number={1} title="Sign in" description="Authenticate with your ATProto handle" />
          <Step number={2} title="Connect" description="Link your Ethereum wallet" />
          <Step number={3} title="Sign" description="Create a cryptographic attestation" />
          <Step number={4} title="Share" description="Anyone can verify the link" />
        </div>
      </div>

      {/* Features */}
      <div className="mt-16">
        <h2 className="text-sm font-[family-name:var(--font-syne)] font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 stagger-children">
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
      <div className="size-6 rounded-full bg-create-accent/10 text-create-accent text-xs font-[family-name:var(--font-outfit)] font-medium 
        flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-outfit)] font-medium text-foreground">{title}</h3>
        <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="size-4 text-create-accent mt-0.5 shrink-0" />
      <div>
        <span className="text-sm font-[family-name:var(--font-outfit)] text-foreground">{title}</span>
        <span className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground"> — {description}</span>
      </div>
    </div>
  )
}
