'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { VerificationCard } from '@/components/VerificationCard'
import type { StoredAttestation, SignatureType } from '@/lib/attestation'

interface VerifiedAttestation extends StoredAttestation {
  verified: boolean
  verifiedSignatureType: SignatureType
  verificationError?: string
}

interface VerificationResult {
  did: string
  handle?: string
  attestations: VerifiedAttestation[]
  verified: boolean
  verifiedAt: string
  message?: string
  error?: string
}

export default function VerifyPage() {
  const params = useParams()
  const identifier = params.identifier as string
  
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!identifier) return

    const verify = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/verify/${encodeURIComponent(identifier)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed')
        }

        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed')
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [identifier])

  if (isLoading) {
    return (
      <div className="pt-12 sm:pt-20 pb-16">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          </div>
          <h2 className="text-lg font-medium text-zinc-800 mb-2">Verifying Identity Link</h2>
          <p className="text-sm text-zinc-500">Checking attestation for @{identifier}</p>
          
          {/* Progress steps */}
          <div className="mt-8 space-y-2 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Resolving identity...
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
              Fetching attestations...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-12 sm:pt-20 pb-16">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 mb-2">
            Verification Failed
          </h2>
          <p className="text-zinc-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  // No attestations found
  if (result.attestations.length === 0) {
    return (
      <div className="pt-12 sm:pt-20 pb-16">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 mb-2">
            No Linked Wallets
          </h2>
          <p className="text-zinc-500 mb-2">
            @{result.handle || identifier} hasn&apos;t linked any wallets yet.
          </p>
          <p className="text-sm text-zinc-400 mb-6">
            DID: {result.did}
          </p>
          <Link
            href="/link"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Link Your Own Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 sm:pt-12 pb-16">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
      </div>

      <VerificationCard
        did={result.did}
        handle={result.handle}
        attestations={result.attestations}
        verifiedAt={result.verifiedAt}
      />

      {/* How verification works */}
      <div className="mt-8 p-4 bg-zinc-50 rounded-xl">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">How verification works</h3>
        <ol className="space-y-2 text-sm text-zinc-600">
          <li className="flex gap-2">
            <span className="text-zinc-400">1.</span>
            We fetch the attestation from the user&apos;s ATProto repository
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400">2.</span>
            We verify the wallet signature matches the claimed address
          </li>
          <li className="flex gap-2">
            <span className="text-zinc-400">3.</span>
            This proves the user controls both identities
          </li>
        </ol>
        <p className="text-xs text-zinc-400 mt-3">
          This verification is cryptographic and cannot be faked.
        </p>
      </div>
    </div>
  )
}
