'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAttestationSigning } from '@/hooks/useAttestationSigning'
import { getChainName, getExplorerUrl } from '@/lib/chains'
import { SigningAnimation } from '@/components/SigningAnimation'

interface ReviewStepProps {
  onSuccess: (uri: string) => void
  onBack: () => void
}

export function ReviewStep({ onSuccess, onBack }: ReviewStepProps) {
  const { session } = useAuth()
  const { address } = useAccount()
  const chainId = useChainId()
  const { signAttestation, isPending, walletType } = useAttestationSigning()
  
  const [status, setStatus] = useState<'idle' | 'signing' | 'storing' | 'error' | 'already-linked'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [showTechnical, setShowTechnical] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check if this wallet+chain is already linked
  useEffect(() => {
    if (!session?.did || !address) {
      setIsChecking(false)
      return
    }

    const checkExisting = async () => {
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(session.did)}`)
        if (res.ok) {
          const data = await res.json()
          // Check for exact address+chain combination
          const existingWallet = data.attestations?.find(
            (a: { address: string; chainId: number }) => 
              a.address.toLowerCase() === address.toLowerCase() && 
              a.chainId === chainId
          )
          if (existingWallet) {
            setStatus('already-linked')
          }
        }
      } catch {
        // Silently fail - just proceed with signing
      } finally {
        setIsChecking(false)
      }
    }

    checkExisting()
  }, [session?.did, address, chainId])

  const handleSign = async () => {
    if (!session?.did || !address) return

    setStatus('signing')
    setError(null)

    try {
      // Step 1: Sign the attestation
      const signedAttestation = await signAttestation(session.did)
      
      setStatus('storing')

      // Step 2: Store in PDS via API
      const response = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: signedAttestation.address,
          chainId: signedAttestation.chainId,
          signature: signedAttestation.signature,
          message: signedAttestation.messageForStorage,
          signatureType: signedAttestation.signatureType,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to store attestation')
      }

      const result = await response.json()
      onSuccess(result.uri)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-500">Checking existing links...</p>
      </div>
    )
  }

  if (status === 'already-linked') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900">
              Already Linked
            </h2>
            <p className="text-sm text-zinc-400">
              This wallet is already connected to your identity
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-3">
            <span className="text-xl">👛</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-zinc-800 truncate">
                {address}
              </p>
              <p className="text-xs text-zinc-500">
                {getChainName(chainId)}
              </p>
            </div>
            <a
              href={getExplorerUrl(chainId, address || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-amber-100 transition-colors"
              title="View on explorer"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-700 font-medium rounded-xl
                       hover:bg-zinc-200 transition-colors"
          >
            Connect Different Wallet
          </button>
          <Link
            href={`/verify/${session?.handle || session?.did}`}
            className="flex-1 py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl
                       hover:bg-emerald-700 transition-colors text-center"
          >
            View Verification
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'signing') {
    return <SigningAnimation walletType={walletType} />
  }

  if (status === 'storing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-medium text-zinc-800 mb-2">Storing Attestation</h3>
        <p className="text-sm text-zinc-500">Saving to your ATProto repository...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
          Review Your Link
        </h1>
        <p className="text-zinc-500">
          You&apos;re about to create a verifiable link between these identities.
        </p>
      </div>

      {/* Link visualization */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        {/* ATProto identity */}
        <div className="bg-white rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦋</span>
            <div>
              <p className="text-sm text-zinc-500">ATProto Identity</p>
              <p className="font-medium text-zinc-800">@{session?.handle}</p>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {session?.did.slice(0, 30)}...
              </p>
            </div>
          </div>
        </div>

        {/* Link arrow */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👛</span>
            <div>
              <p className="text-sm text-zinc-500">Ethereum Wallet</p>
              <p className="font-mono text-sm text-zinc-800">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                on {getChainName(chainId)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
        <span className="text-xl">🛡️</span>
        <div>
          <p className="font-medium text-green-800">Safe to sign</p>
          <p className="text-sm text-green-700 mt-0.5">
            This signature only proves ownership. It cannot access your funds or make transactions.
          </p>
        </div>
      </div>

      {/* Technical details toggle */}
      <button
        onClick={() => setShowTechnical(!showTechnical)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showTechnical ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        View technical details
      </button>

      {showTechnical && (
        <div className="p-4 bg-zinc-50 rounded-xl font-mono text-xs text-zinc-600 overflow-x-auto">
          <pre>{JSON.stringify({
            domain: {
              name: 'ATProto EVM Attestation',
              version: '1',
            },
            message: {
              did: session?.did,
              evmAddress: address,
              chainId: chainId,
              timestamp: Math.floor(Date.now() / 1000),
              nonce: 1,
            },
          }, null, 2)}</pre>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="font-medium text-red-800">Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={() => { setStatus('idle'); setError(null) }}
            className="text-sm text-red-700 underline mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isPending}
          className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-700 font-medium rounded-xl
                     hover:bg-zinc-200 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleSign}
          disabled={isPending || status !== 'idle'}
          className="flex-1 py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl
                     hover:bg-emerald-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {walletType === 'smart-wallet' ? '🔐 Sign with Biometrics' : '✍️ Sign Message'}
        </button>
      </div>
    </div>
  )
}
