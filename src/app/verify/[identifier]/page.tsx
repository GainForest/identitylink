'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getChainName, getExplorerUrl, CHAIN_COLORS, sortByChainId, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { TipModal, CoffeeButton } from '@/components/TipModal'
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

// Group attestations by address
interface WalletGroup {
  address: string
  attestations: VerifiedAttestation[]
  linkedChainIds: number[]
}

interface VerificationResult {
  did: string
  handle?: string
  displayName?: string
  avatar?: string
  pds?: string
  attestations: VerifiedAttestation[]
  verified: boolean
  verifiedAt: string
}

export default function VerifyIdentifierPage() {
  const params = useParams()
  const router = useRouter()
  const identifier = params.identifier as string
  
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isTipModalOpen, setIsTipModalOpen] = useState(false)

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
        setInput(data.handle || identifier)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed')
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [identifier])

  const handleCopy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback for older browsers
    }
  }, [])

  const handleSearch = useCallback(() => {
    const cleaned = input.trim().replace(/^@/, '')
    if (cleaned && cleaned !== identifier) {
      router.push(`/verify/${encodeURIComponent(cleaned)}`)
    }
  }, [input, identifier, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  if (isLoading) {
    return (
      <div className="pt-12 sm:pt-20 pb-16 flex flex-col items-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Verifying @{identifier}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-12 sm:pt-20 pb-16 flex flex-col items-center">
        <div className="w-full max-w-md">
          {/* Search bar */}
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Handle or DID..."
              className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg
                         text-sm text-zinc-800 placeholder-zinc-400
                         focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
            >
              Look up
            </button>
          </div>

          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-medium text-zinc-900 mb-2">Could not verify</h2>
            <p className="text-sm text-zinc-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  // Group attestations by address, sorted with Ethereum first
  const walletGroups: WalletGroup[] = result.attestations.reduce((groups, attestation) => {
    const existing = groups.find(g => g.address.toLowerCase() === attestation.address.toLowerCase())
    if (existing) {
      existing.attestations.push(attestation)
      existing.linkedChainIds.push(attestation.chainId)
    } else {
      groups.push({
        address: attestation.address,
        attestations: [attestation],
        linkedChainIds: [attestation.chainId],
      })
    }
    return groups
  }, [] as WalletGroup[])
  
  // Sort attestations within each group (Ethereum first)
  walletGroups.forEach(group => {
    group.attestations = sortByChainId(group.attestations)
  })

  return (
    <div className="pt-8 sm:pt-12 pb-16 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Search bar */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Handle or DID..."
            className="flex-1 px-3 py-2 bg-white/50 border border-zinc-200/60 rounded-lg
                       text-sm text-zinc-800 placeholder-zinc-400
                       focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100
                       focus:bg-white/70 transition-all"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
          >
            Look up
          </button>
        </div>

        {/* Identity header */}
        <div className="space-y-1 mb-6">
          {result.pds && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[10px] text-zinc-300 w-8 shrink-0">PDS</span>
              <span className="font-mono text-xs text-zinc-500">{result.pds}</span>
              <CopyButton
                value={`https://${result.pds}`}
                copied={copiedField === 'pds'}
                onCopy={() => handleCopy(`https://${result.pds}`, 'pds')}
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[10px] text-zinc-300 w-8 shrink-0">ID</span>
            <div className="flex items-center gap-2 min-w-0">
              {result.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.avatar}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-zinc-800">
                {result.displayName || result.handle || result.did.slice(0, 20) + '...'}
              </span>
              {result.attestations.some(a => a.verified) && (
                <>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Verified
                  </span>
                  <CoffeeButton onClick={() => setIsTipModalOpen(true)} />
                </>
              )}
            </div>
          </div>
          {result.handle && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[10px] text-zinc-300 w-8 shrink-0"></span>
              <span className="text-zinc-500">@{result.handle}</span>
              <CopyButton
                value={result.handle}
                copied={copiedField === 'handle'}
                onCopy={() => handleCopy(result.handle!, 'handle')}
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-zinc-300 w-8 shrink-0"></span>
            <span className="font-mono text-xs text-zinc-400 break-all">{result.did}</span>
            <CopyButton
              value={result.did}
              copied={copiedField === 'did'}
              onCopy={() => handleCopy(result.did, 'did')}
            />
          </div>
        </div>

        {/* Wallets */}
        {result.attestations.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-1">No linked wallets</p>
            <p className="text-xs text-zinc-400">This user hasn&apos;t linked any wallets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700">
              Linked Wallets ({walletGroups.length})
            </h3>
            
            {walletGroups.map(group => (
              <WalletGroupCard
                key={group.address}
                group={group}
                copiedField={copiedField}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}

        {/* Verification timestamp */}
        <p className="text-xs text-zinc-400 mt-6">
          Verified at {new Date(result.verifiedAt).toLocaleString()}
        </p>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-zinc-100">
          <Link
            href="/verify"
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            ← Verify another identity
          </Link>
        </div>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        recipientName={result.displayName || result.handle}
        recipientAddress={result.attestations.find(a => a.verified)?.address || ''}
      />
    </div>
  )
}

function WalletGroupCard({
  group,
  copiedField,
  onCopy,
}: {
  group: WalletGroup
  copiedField: string | null
  onCopy: (value: string, field: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const allValid = group.attestations.every(a => a.verified)
  const hasInvalid = group.attestations.some(a => !a.verified)

  return (
    <div className={`rounded-xl border ${
      allValid 
        ? 'bg-emerald-50/50 border-emerald-200' 
        : hasInvalid
          ? 'bg-amber-50/50 border-amber-200'
          : 'bg-zinc-50 border-zinc-200'
    }`}>
      {/* Main card */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Status */}
            <div className="flex items-center gap-2 mb-1">
              {allValid ? (
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              <span className={`text-sm font-medium ${allValid ? 'text-emerald-800' : 'text-amber-800'}`}>
                {group.attestations.length} chain{group.attestations.length > 1 ? 's' : ''} linked
              </span>
            </div>
            
            {/* Address */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-zinc-700 truncate">
                {group.address}
              </span>
              <CopyButton
                value={group.address}
                copied={copiedField === group.address}
                onCopy={() => onCopy(group.address, group.address)}
              />
              <a
                href={getExplorerUrl(group.attestations[0].chainId, group.address)}
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
            
            {/* Chain badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {group.attestations.map(attestation => (
                <button
                  key={attestation.rkey}
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: `${CHAIN_COLORS[attestation.chainId as SupportedChainId]}15`,
                    color: CHAIN_COLORS[attestation.chainId as SupportedChainId],
                  }}
                  title={`${attestation.verified ? 'Verified' : 'Invalid'} on ${getChainName(attestation.chainId)}`}
                >
                  <ChainIcon chainId={attestation.chainId} className="w-3 h-3" />
                  {attestation.verified ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                  {getChainName(attestation.chainId)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Expand/collapse button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-2 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-zinc-200/50 px-4 py-3 space-y-2">
          {group.attestations.map(attestation => (
            <div 
              key={attestation.rkey}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/50"
            >
              <div className="flex items-center gap-3">
                <span style={{ color: CHAIN_COLORS[attestation.chainId as SupportedChainId] }}>
                  <ChainIcon chainId={attestation.chainId} className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-700">
                    {getChainName(attestation.chainId)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(attestation.createdAt).toLocaleDateString()} · {attestation.signatureType}
                  </p>
                </div>
                {attestation.verified ? (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                    Valid
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                    Invalid
                  </span>
                )}
              </div>
              {attestation.verificationError && (
                <span className="text-xs text-red-500">{attestation.verificationError}</span>
              )}
            </div>
          ))}
        </div>
      )}
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
      className="p-1 rounded hover:bg-zinc-100 transition-colors shrink-0"
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
