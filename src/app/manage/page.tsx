'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { getChainName } from '@/lib/chains'
import type { AttestationWithKey } from '@/lib/pds'

export default function ManagePage() {
  const { session, isLoading: authLoading } = useAuth()
  const [attestations, setAttestations] = useState<AttestationWithKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAttestations = useCallback(async () => {
    if (!session?.did) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/attestations/${encodeURIComponent(session.did)}`)
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

  if (authLoading) {
    return (
      <div className="pt-12 sm:pt-20 pb-16">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 rounded w-48 mb-4" />
          <div className="h-4 bg-zinc-100 rounded w-64" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pt-12 sm:pt-20 pb-16">
        <div className="max-w-md">
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-zinc-500 mb-6">
            Please sign in with your Bluesky account to manage your linked wallets.
          </p>
          <Link
            href="/link"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-12 sm:pt-20 pb-16">
      <div className="max-w-md">
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
          Manage Linked Wallets
        </h1>
        <p className="text-zinc-500 mb-6">
          View and manage wallets linked to @{session.handle || session.did}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse p-4 bg-zinc-50 rounded-xl">
                <div className="h-4 bg-zinc-200 rounded w-32 mb-2" />
                <div className="h-3 bg-zinc-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : attestations.length === 0 ? (
          <div className="p-6 bg-zinc-50 rounded-xl text-center">
            <p className="text-zinc-500 mb-4">No wallets linked yet.</p>
            <Link
              href="/link"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Link a Wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attestations.map(attestation => (
              <div
                key={attestation.rkey}
                className="p-4 bg-white border border-zinc-200 rounded-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-zinc-800 truncate">
                      {attestation.address}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {getChainName(attestation.chainId)} &bull;{' '}
                      {new Date(attestation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnlink(attestation.rkey)}
                    disabled={deletingKey === attestation.rkey}
                    className="shrink-0 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 
                             hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingKey === attestation.rkey ? 'Unlinking...' : 'Unlink'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-100">
          <Link
            href="/link"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Link another wallet
          </Link>
        </div>
      </div>
    </div>
  )
}
