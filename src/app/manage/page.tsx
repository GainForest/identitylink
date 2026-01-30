'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { getChainName, getExplorerUrl } from '@/lib/chains'
import type { SignatureType } from '@/lib/attestation'

interface VerifiedAttestation {
  address: string
  chainId: number
  signature: string
  signatureType: SignatureType
  createdAt: string
  verified: boolean
  verifiedSignatureType: SignatureType
  verificationError?: string
  rkey: string
}

export default function ManagePage() {
  const { session, isLoading: authLoading } = useAuth()
  const [attestations, setAttestations] = useState<VerifiedAttestation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback for older browsers
    }
  }, [])

  const fetchAttestations = useCallback(async () => {
    if (!session?.did) return

    try {
      setIsLoading(true)
      // Use the verify endpoint to get verification status
      const res = await fetch(`/api/verify/${encodeURIComponent(session.did)}`)
      if (res.ok) {
        const data = await res.json()
        setAttestations(data.attestations || [])
      }
    } catch (err) {
      console.error('Failed to fetch attestations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [session?.did])

  useEffect(() => {
    if (session?.did) {
      fetchAttestations()
    }
  }, [session?.did, fetchAttestations])

  const handleUnlink = async (rkey: string) => {
    if (!session?.did) return

    const confirmed = window.confirm(
      'Are you sure you want to unlink this wallet? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      setDeletingKey(rkey)
      setError(null)

      const res = await fetch(
        `/api/attestations/${encodeURIComponent(session.did)}/${encodeURIComponent(rkey)}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to unlink')
      }

      // Remove from local state
      setAttestations(prev => prev.filter(a => a.rkey !== rkey))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink wallet')
    } finally {
      setDeletingKey(null)
    }
  }

  // Count verified vs total
  const verifiedCount = attestations.filter(a => a.verified).length
  const totalCount = attestations.length

  if (authLoading) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm text-zinc-500 mt-4">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
            Sign In Required
          </h1>
          <p className="text-zinc-500 max-w-sm">
            Sign in with your ATProto account to manage your linked wallets.
          </p>
        </div>
        <Link
          href="/link"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-8 sm:pt-12 pb-16 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900">
            Manage Wallets
          </h1>
          <p className="text-zinc-500 mt-2">
            View and manage your linked wallets
          </p>
        </div>

        {/* Identity header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-zinc-300 w-8 shrink-0">ID</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-zinc-800">
                @{session.handle || session.did.slice(0, 20) + '...'}
              </span>
              {totalCount > 0 && (
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  verifiedCount === totalCount 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {verifiedCount === totalCount ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                  {verifiedCount}/{totalCount} verified
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-zinc-300 w-8 shrink-0"></span>
            <span className="font-mono text-xs text-zinc-400 break-all">{session.did}</span>
            <CopyButton
              value={session.did}
              copied={copiedField === 'did'}
              onCopy={() => handleCopy(session.did, 'did')}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse p-4 bg-zinc-50 rounded-xl">
                <div className="h-4 bg-zinc-200 rounded w-48 mb-2" />
                <div className="h-3 bg-zinc-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : attestations.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-1">No linked wallets</p>
            <p className="text-xs text-zinc-400 mb-4">Link a wallet to create a verifiable identity attestation.</p>
            <Link
              href="/link"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Link a Wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700">
              Linked Wallets ({attestations.length})
            </h3>
            
            {attestations.map(attestation => (
              <WalletCard
                key={attestation.rkey}
                attestation={attestation}
                copiedField={copiedField}
                onCopy={handleCopy}
                onUnlink={() => handleUnlink(attestation.rkey)}
                isDeleting={deletingKey === attestation.rkey}
              />
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <Link
            href="/link"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Link another wallet
          </Link>
          <Link
            href={`/verify/${session.handle || session.did}`}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            View public profile →
          </Link>
        </div>
      </div>
    </div>
  )
}

function WalletCard({
  attestation,
  copiedField,
  onCopy,
  onUnlink,
  isDeleting,
}: {
  attestation: VerifiedAttestation
  copiedField: string | null
  onCopy: (value: string, field: string) => void
  onUnlink: () => void
  isDeleting: boolean
}) {
  const isValid = attestation.verified

  return (
    <div className={`p-4 rounded-xl border ${
      isValid 
        ? 'bg-emerald-50/50 border-emerald-200' 
        : 'bg-red-50/50 border-red-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isValid ? (
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <span className={`text-sm font-medium ${isValid ? 'text-emerald-800' : 'text-red-800'}`}>
              {isValid ? 'Valid Signature' : 'Invalid Signature'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-zinc-700 truncate">
              {attestation.address}
            </span>
            <CopyButton
              value={attestation.address}
              copied={copiedField === attestation.address}
              onCopy={() => onCopy(attestation.address, attestation.address)}
            />
            <a
              href={getExplorerUrl(attestation.chainId, attestation.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-white/50 transition-colors shrink-0"
              title="View on block explorer"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757" />
              </svg>
              {getChainName(attestation.chainId)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(attestation.createdAt).toLocaleDateString()}
            </span>
            <span className="px-1.5 py-0.5 bg-white/50 rounded text-[10px] uppercase tracking-wide">
              {attestation.signatureType}
            </span>
          </div>

          {attestation.verificationError && (
            <p className="mt-2 text-xs text-red-600">{attestation.verificationError}</p>
          )}
        </div>
        
        <button
          onClick={onUnlink}
          disabled={isDeleting}
          className={`shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50 ${
            isValid 
              ? 'text-zinc-400 hover:text-red-600 hover:bg-red-50' 
              : 'text-red-400 hover:text-red-600 hover:bg-red-100'
          }`}
          title="Unlink wallet"
        >
          {isDeleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

function CopyButton({
  value,
  copied,
  onCopy,
}: {
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <button
      onClick={onCopy}
      className="p-1 rounded hover:bg-white/50 transition-colors shrink-0"
      title={copied ? 'Copied!' : `Copy ${value.slice(0, 20)}...`}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
    </button>
  )
}
