'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getChainName, getExplorerUrl, CHAIN_COLORS, sortByChainId, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { TipModal, CoffeeButton } from '@/components/TipModal'
import type { SignatureType } from '@/lib/attestation'
import {
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  Link2Off,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

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
          <Loader2 className="w-12 h-12 text-create-accent animate-spin mb-4" />
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground">Verifying @{identifier}...</p>
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
              className="flex-1 px-3 py-2 bg-background border border-input rounded-lg
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30
                         font-[family-name:var(--font-outfit)]"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 text-sm text-create-accent font-medium hover:text-create-accent/80
                         font-[family-name:var(--font-outfit)] transition-colors"
            >
              Look up
            </button>
          </div>

          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/5 border border-destructive/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="font-[family-name:var(--font-syne)] font-semibold text-foreground mb-2">Could not verify</h2>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground">{error}</p>
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
            className="flex-1 px-3 py-2 bg-background border border-input rounded-lg
                       text-sm text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30
                       transition-all font-[family-name:var(--font-outfit)]"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 text-sm text-create-accent font-medium hover:text-create-accent/80
                       font-[family-name:var(--font-outfit)] transition-colors"
          >
            Look up
          </button>
        </div>

        {/* Identity header */}
        <div className="space-y-1 mb-6">
          {result.pds && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[10px] text-muted-foreground/40 w-8 shrink-0">PDS</span>
              <span className="font-mono text-xs text-muted-foreground">{result.pds}</span>
              <CopyButton
                value={`https://${result.pds}`}
                copied={copiedField === 'pds'}
                onCopy={() => handleCopy(`https://${result.pds}`, 'pds')}
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[10px] text-muted-foreground/40 w-8 shrink-0">ID</span>
            <div className="flex items-center gap-2 min-w-0">
              {result.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.avatar}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-foreground font-[family-name:var(--font-outfit)]">
                {result.displayName || result.handle || result.did.slice(0, 20) + '...'}
              </span>
              {result.attestations.some(a => a.verified) && (
                <>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-create-accent/10 text-create-accent rounded-full text-[10px] font-medium font-[family-name:var(--font-outfit)]">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                  <CoffeeButton onClick={() => setIsTipModalOpen(true)} />
                </>
              )}
            </div>
          </div>
          {result.handle && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[10px] text-muted-foreground/40 w-8 shrink-0"></span>
              <span className="font-[family-name:var(--font-outfit)] text-muted-foreground">@{result.handle}</span>
              <CopyButton
                value={result.handle}
                copied={copiedField === 'handle'}
                onCopy={() => handleCopy(result.handle!, 'handle')}
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-muted-foreground/40 w-8 shrink-0"></span>
            <span className="font-mono text-xs text-muted-foreground break-all">{result.did}</span>
            <CopyButton
              value={result.did}
              copied={copiedField === 'did'}
              onCopy={() => handleCopy(result.did, 'did')}
            />
          </div>
        </div>

        {/* Wallets */}
        {result.attestations.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-xl">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
              <Link2Off className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mb-1">No linked wallets</p>
            <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground/70">This user hasn&apos;t linked any wallets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-[family-name:var(--font-syne)] font-semibold text-sm text-foreground">
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
        <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground mt-6">
          Verified at {new Date(result.verifiedAt).toLocaleString()}
        </p>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/verify"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground
                       font-[family-name:var(--font-outfit)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Verify another identity
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
    <div className={`glass-panel rounded-xl border overflow-hidden transition-all duration-300 ${
      allValid 
        ? 'border-create-accent/40 hover:border-create-accent/60 hover:shadow-md' 
        : hasInvalid
          ? 'border-destructive/30 hover:border-destructive/50 hover:shadow-md'
          : 'border-border/50 hover:border-border hover:shadow-md'
    }`}>
      {/* Main card */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Status */}
            <div className="flex items-center gap-2 mb-1">
              {allValid ? (
                <Check className="w-4 h-4 text-create-accent shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              )}
              <span className={`font-[family-name:var(--font-outfit)] text-sm font-medium ${allValid ? 'text-create-accent' : 'text-destructive'}`}>
                {group.attestations.length} chain{group.attestations.length > 1 ? 's' : ''} linked
              </span>
            </div>
            
            {/* Address */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground truncate">
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
                className="p-1 rounded hover:bg-secondary transition-colors shrink-0"
                title="View on block explorer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
            
            {/* Chain badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {group.attestations.map(attestation => (
                <button
                  key={attestation.rkey}
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-colors hover:opacity-80 font-[family-name:var(--font-outfit)]"
                  style={{ 
                    backgroundColor: `${CHAIN_COLORS[attestation.chainId as SupportedChainId]}15`,
                    color: CHAIN_COLORS[attestation.chainId as SupportedChainId],
                  }}
                  title={`${attestation.verified ? 'Verified' : 'Invalid'} on ${getChainName(attestation.chainId)}`}
                >
                  <ChainIcon chainId={attestation.chainId} className="w-3 h-3" />
                  {attestation.verified ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {getChainName(attestation.chainId)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Expand/collapse button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 space-y-2">
          {group.attestations.map(attestation => (
            <div 
              key={attestation.rkey}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-card"
            >
              <div className="flex items-center gap-3">
                <span style={{ color: CHAIN_COLORS[attestation.chainId as SupportedChainId] }}>
                  <ChainIcon chainId={attestation.chainId} className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-[family-name:var(--font-syne)] font-semibold text-sm text-foreground">
                    {getChainName(attestation.chainId)}
                  </p>
                  <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground">
                    {new Date(attestation.createdAt).toLocaleDateString()} · {attestation.signatureType}
                  </p>
                </div>
                {attestation.verified ? (
                  <span className="px-1.5 py-0.5 bg-create-accent/10 text-create-accent rounded-full text-[10px] font-medium font-[family-name:var(--font-outfit)]">
                    Valid
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-destructive/5 text-destructive border border-destructive/30 rounded-full text-[10px] font-medium font-[family-name:var(--font-outfit)]">
                    Invalid
                  </span>
                )}
              </div>
              {attestation.verificationError && (
                <span className="font-[family-name:var(--font-outfit)] text-xs text-destructive">{attestation.verificationError}</span>
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
      className="p-1 rounded hover:bg-secondary transition-colors shrink-0"
      title={copied ? 'Copied!' : `Copy ${value.slice(0, 20)}...`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-create-accent" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </button>
  )
}
