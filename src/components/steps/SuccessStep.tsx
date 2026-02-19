'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { getChainName } from '@/lib/chains'
import { CheckCircle, Plus, Copy, Check, Link2 } from 'lucide-react'

interface SuccessStepProps {
  attestationUri: string
}

export function SuccessStep({ attestationUri }: SuccessStepProps) {
  const { session } = useAuth()
  const { address, chain } = useAccount()
  const [copied, setCopied] = useState(false)

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${session?.handle || session?.did}`
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = verifyUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="size-10 mx-auto mb-4 rounded-full bg-create-accent/10 flex items-center justify-center animate-scale-in">
          <Check className="size-5 text-create-accent" />
        </div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl text-foreground font-bold mb-2">
          Identity Successfully Linked!
        </h1>
        <p className="font-[family-name:var(--font-outfit)] text-muted-foreground">
          Your ATProto identity is now verifiably connected to your Ethereum wallet.
        </p>
      </div>

      {/* Linked identities summary */}
      <div className="glass-panel rounded-2xl p-6 border border-border/50">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-2">
              <span className="text-xl">🦋</span>
            </div>
            <p className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground">
              @{session?.handle}
            </p>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-create-accent/10 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-create-accent" />
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-2">
              <span className="text-xl">👛</span>
            </div>
            <p className="text-sm font-mono text-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground">
              {chain ? getChainName(chain.id) : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Share section */}
      <div className="space-y-3">
        <p className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground">Share your verification link</p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={verifyUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg text-muted-foreground font-mono"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-[family-name:var(--font-outfit)] font-medium transition-colors ${
              copied
                ? 'bg-create-accent/10 text-create-accent'
                : 'bg-secondary text-foreground hover:bg-accent'
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
            ) : (
              <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> Copy</span>
            )}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/verify/${session?.handle || session?.did}`}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary border border-border
                     text-foreground font-[family-name:var(--font-outfit)] font-medium rounded-xl hover:bg-accent transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          View Verification
        </Link>
        
        <Link
          href="/link"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-create-accent
                     text-create-accent-foreground font-[family-name:var(--font-outfit)] font-medium rounded-xl hover:bg-create-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Link Another Wallet
        </Link>
      </div>

      {/* What's next section */}
      <div className="border-t border-border/50 pt-6">
        <h3 className="text-sm font-[family-name:var(--font-syne)] font-medium text-foreground mb-3">What can you do now?</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-lg">💸</span>
            <div>
              <p className="font-[family-name:var(--font-outfit)] font-medium text-foreground">Receive payments</p>
              <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground">
                Share your handle and people can send crypto directly to your linked wallet
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">🏆</span>
            <div>
              <p className="font-[family-name:var(--font-outfit)] font-medium text-foreground">Build reputation</p>
              <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground">
                Your on-chain activity can now be tied to your social identity
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="font-[family-name:var(--font-outfit)] font-medium text-foreground">Prove ownership</p>
              <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground">
                Anyone can cryptographically verify you control both identities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attestation URI (technical) */}
      <details className="text-sm">
        <summary className="font-[family-name:var(--font-outfit)] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground">
          Technical details
        </summary>
        <p className="mt-2 font-mono text-xs text-muted-foreground break-all bg-muted p-2 rounded">
          Attestation URI: {attestationUri}
        </p>
      </details>
    </div>
  )
}
