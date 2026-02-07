'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getChainName, getExplorerUrl, CHAIN_COLORS, sortByChainId, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { TipModal, CoffeeButton } from '@/components/TipModal'
import { SOCIAL_PLATFORMS, type SocialPlatform } from '@/lib/attestation'
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

interface SocialLink {
  platform: SocialPlatform
  handle: string
  url?: string
  createdAt: string
  rkey: string
}

interface VerificationResult {
  did: string
  handle?: string
  displayName?: string
  avatar?: string
  pds?: string
  attestations: VerifiedAttestation[]
  socialLinks?: SocialLink[]
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

        {/* Social Links */}
        {result.socialLinks && result.socialLinks.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-medium text-zinc-700">
              Social Profiles ({result.socialLinks.length})
            </h3>
            <div className="space-y-2">
              {result.socialLinks.map(link => {
                const config = SOCIAL_PLATFORMS.find(p => p.id === link.platform)
                return (
                  <div
                    key={link.rkey}
                    className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <SocialPlatformIcon platform={link.platform} className="w-4 h-4 text-zinc-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-800">
                        {config?.label || link.platform}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{link.handle}</p>
                    </div>
                    {link.url && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-zinc-100 transition-colors shrink-0"
                        title="Open profile"
                      >
                        <svg className="w-4 h-4 text-zinc-400 hover:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
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

function SocialPlatformIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    case 'telegram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      )
    case 'discord':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'website':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      )
  }
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
