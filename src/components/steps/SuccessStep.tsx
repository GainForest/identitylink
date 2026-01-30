'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { getChainName } from '@/lib/chains'

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
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
          Identity Successfully Linked!
        </h1>
        <p className="text-zinc-500">
          Your ATProto identity is now verifiably connected to your Ethereum wallet.
        </p>
      </div>

      {/* Linked identities summary */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-white border border-emerald-200 flex items-center justify-center mb-2">
              <span className="text-xl">🦋</span>
            </div>
            <p className="text-sm font-medium text-zinc-800">
              @{session?.handle}
            </p>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-white border border-emerald-200 flex items-center justify-center mb-2">
              <span className="text-xl">👛</span>
            </div>
            <p className="text-sm font-mono text-zinc-800">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-xs text-zinc-500">
              {chain ? getChainName(chain.id) : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Share section */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-700">Share your verification link</p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={verifyUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600 font-mono"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/verify/${session?.handle || session?.did}`}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-zinc-200 
                     text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Verification
        </Link>
        
        <Link
          href="/link"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 
                     text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Link Another Wallet
        </Link>
      </div>

      {/* What's next section */}
      <div className="border-t border-zinc-100 pt-6">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">What can you do now?</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-lg">💸</span>
            <div>
              <p className="font-medium text-zinc-800">Receive payments</p>
              <p className="text-sm text-zinc-500">
                Share your handle and people can send crypto directly to your linked wallet
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">🏆</span>
            <div>
              <p className="font-medium text-zinc-800">Build reputation</p>
              <p className="text-sm text-zinc-500">
                Your on-chain activity can now be tied to your social identity
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="font-medium text-zinc-800">Prove ownership</p>
              <p className="text-sm text-zinc-500">
                Anyone can cryptographically verify you control both identities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attestation URI (technical) */}
      <details className="text-sm">
        <summary className="text-zinc-400 cursor-pointer hover:text-zinc-600">
          Technical details
        </summary>
        <p className="mt-2 font-mono text-xs text-zinc-500 break-all bg-zinc-50 p-2 rounded">
          Attestation URI: {attestationUri}
        </p>
      </details>
    </div>
  )
}
