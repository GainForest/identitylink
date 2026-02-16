'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAttestationSigning } from '@/hooks/useAttestationSigning'
import { getChainName, getExplorerUrl, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
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

  // Check if this wallet+chain is already linked - re-check when address/chain changes
  useEffect(() => {
    if (!session?.did || !address) {
      setIsChecking(false)
      return
    }

    // Reset state when address/chain changes
    setIsChecking(true)
    setStatus('idle')
    setError(null)

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
        <div className="w-8 h-8 border-2 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking existing links...</p>
      </div>
    )
  }

  if (status === 'already-linked') {
    return (
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 dark:text-zinc-100">
            Already Linked
          </h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
            This wallet is already connected on {getChainName(chainId)}
          </p>
        </div>

        {/* Wallet card */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200 truncate">
                {address}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Verified on {getChainName(chainId)}
              </p>
            </div>
            <a
              href={getExplorerUrl(chainId, address || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-emerald-100 transition-colors"
              title="View on explorer"
            >
              <svg className="w-4 h-4 text-zinc-400 hover:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>

        {/* Actions - sungai style */}
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              Connect a different wallet
            </span>
          </button>

          <Link
            href={`/verify/${session?.handle || session?.did}`}
            className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              View verification page
            </span>
          </Link>

          <Link
            href="/manage"
            className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Manage linked wallets
            </span>
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
        <div className="w-8 h-8 border-2 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Storing attestation...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 dark:text-zinc-100">
          Review & Sign
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
          Create a verifiable link between these identities
        </p>
      </div>

      {/* Link visualization */}
      <div className="space-y-2 mb-6">
        {/* ATProto identity */}
        <div className="flex items-center gap-3 py-3 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">@{session?.handle}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono truncate">{session?.did}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-1">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3 py-3 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <span 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: `${CHAIN_COLORS[chainId as SupportedChainId]}15`,
              color: CHAIN_COLORS[chainId as SupportedChainId],
            }}
          >
            <ChainIcon chainId={chainId} className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{getChainName(chainId)}</p>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50 mb-6">
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          This signature only proves ownership. It cannot access your funds or make transactions.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg mb-6">
          <svg className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => { setStatus('idle'); setError(null) }}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isPending}
          className="py-2.5 px-4 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleSign}
          disabled={isPending || status !== 'idle'}
          className="flex-1 py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg
                     hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {walletType === 'smart-wallet' ? 'Sign with Biometrics' : 'Sign & Link'}
        </button>
      </div>

      {/* Technical details */}
      <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${showTechnical ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          Technical details
        </button>

        {showTechnical && (
          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg font-mono text-[10px] text-zinc-500 dark:text-zinc-400 overflow-x-auto">
            <pre>{JSON.stringify({
              domain: { name: 'ATProto EVM Attestation', version: '1' },
              message: { did: session?.did, evmAddress: address, chainId },
            }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
