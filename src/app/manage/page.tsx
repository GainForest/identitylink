'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { getChainName, getExplorerUrl, SUPPORTED_CHAIN_IDS, CHAIN_COLORS, sortByChainId, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import type { SignatureType } from '@/lib/attestation'
import { Wallet, AlertCircle, CheckCircle, ExternalLink, Trash2, Copy, Check, ChevronDown, Plus, Loader2 } from 'lucide-react'

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

  // Group attestations by address, sorted with Ethereum first
  const walletGroups: WalletGroup[] = attestations.reduce((groups, attestation) => {
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

  if (authLoading) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <Loader2 className="size-12 text-create-accent/20 border-t-create-accent animate-spin" />
        <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mt-4">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <div className="glass-panel rounded-xl border border-border/50 p-8 text-center max-w-sm w-full">
          <Wallet className="size-12 text-muted-foreground/30 mx-auto mb-3" />
          <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl text-foreground font-bold tracking-tight mb-2">
            Sign In Required
          </h1>
          <p className="font-[family-name:var(--font-outfit)] text-muted-foreground max-w-sm mb-6">
            Sign in with your ATProto account to manage your linked wallets.
          </p>
          <Link
            href="/link"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-create-accent text-create-accent-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 sm:pt-12 pb-16 flex flex-col items-center animate-fade-in-up">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
            Manage Wallets
          </h1>
          <p className="font-[family-name:var(--font-outfit)] text-muted-foreground mt-2">
            View and manage your linked wallets
          </p>
        </div>

        {/* Identity header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-[family-name:var(--font-outfit)] text-[10px] text-muted-foreground/40 w-8 shrink-0">ID</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-foreground">
                @{session.handle || session.did.slice(0, 20) + '...'}
              </span>
              {totalCount > 0 && (
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  verifiedCount === totalCount 
                    ? 'bg-create-accent/10 text-create-accent' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {verifiedCount === totalCount ? (
                    <CheckCircle className="size-3" />
                  ) : (
                    <AlertCircle className="size-3" />
                  )}
                  {verifiedCount}/{totalCount} verified
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-[family-name:var(--font-outfit)] text-[10px] text-muted-foreground/40 w-8 shrink-0"></span>
            <span className="font-mono text-xs text-muted-foreground break-all">{session.did}</span>
            <CopyButton
              value={session.did}
              copied={copiedField === 'did'}
              onCopy={() => handleCopy(session.did, 'did')}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <p className="font-[family-name:var(--font-outfit)] text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse p-4 bg-muted rounded-xl">
                <div className="h-4 bg-secondary rounded w-48 mb-2" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            ))}
          </div>
        ) : attestations.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 border border-border/50 text-center">
            <Wallet className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mb-1">No linked wallets yet</p>
            <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground/60 mb-4">Link a wallet to create a verifiable identity attestation.</p>
            <Link
              href="/link"
              className="inline-flex items-center gap-2 px-4 py-2 bg-create-accent text-create-accent-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="size-4" />
              Link a Wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            <h3 className="font-[family-name:var(--font-syne)] font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Linked Wallets ({walletGroups.length})
            </h3>
            
            {walletGroups.map(group => (
              <WalletGroupCard
                key={group.address}
                group={group}
                copiedField={copiedField}
                onCopy={handleCopy}
                onUnlink={handleUnlink}
                deletingKey={deletingKey}
              />
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <Link
            href="/link"
            className="inline-flex items-center gap-2 text-sm text-create-accent hover:opacity-80 transition-opacity font-[family-name:var(--font-outfit)]"
          >
            <Plus className="size-4" />
            Link another wallet
          </Link>
          <Link
            href={`/verify/${session.handle || session.did}`}
            className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View public profile →
          </Link>
        </div>
      </div>
    </div>
  )
}

function WalletGroupCard({
  group,
  copiedField,
  onCopy,
  onUnlink,
  deletingKey,
}: {
  group: WalletGroup
  copiedField: string | null
  onCopy: (value: string, field: string) => void
  onUnlink: (rkey: string) => void
  deletingKey: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const allValid = group.attestations.every(a => a.verified)
  // Unlinked chains already in correct order since SUPPORTED_CHAIN_IDS has Ethereum first
  const unlinkedChains = SUPPORTED_CHAIN_IDS.filter(id => !group.linkedChainIds.includes(id))

  return (
    <div className="glass-panel rounded-xl border border-border/50 hover:border-create-accent/40 transition-all duration-300">
      {/* Main card */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Status */}
            <div className="flex items-center gap-2 mb-1">
              {allValid ? (
                <CheckCircle className="size-4 text-create-accent shrink-0" />
              ) : (
                <AlertCircle className="size-4 text-amber-500 shrink-0" />
              )}
              <span className={`font-[family-name:var(--font-outfit)] text-sm font-medium ${allValid ? 'text-create-accent' : 'text-amber-600'}`}>
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
                <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
            
            {/* Chain badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {/* Linked chains */}
              {group.attestations.map(attestation => (
                <button
                  key={attestation.rkey}
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: `${CHAIN_COLORS[attestation.chainId as SupportedChainId]}15`,
                    color: CHAIN_COLORS[attestation.chainId as SupportedChainId],
                  }}
                  title={`Linked on ${getChainName(attestation.chainId)}`}
                >
                  <ChainIcon chainId={attestation.chainId} className="w-3 h-3" />
                  {attestation.verified ? (
                    <Check className="size-3" />
                  ) : (
                    <AlertCircle className="size-3" />
                  )}
                  {getChainName(attestation.chainId)}
                </button>
              ))}
              
              {/* Unlinked chains - show as add buttons */}
              {unlinkedChains.map(chainId => (
                <Link
                  key={chainId}
                  href="/link"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium 
                           bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={`Add ${getChainName(chainId)}`}
                >
                  <ChainIcon chainId={chainId} className="w-3 h-3" />
                  <Plus className="size-3" />
                  {getChainName(chainId)}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Expand/collapse button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 space-y-2">
          {group.attestations.map(attestation => (
            <div 
              key={attestation.rkey}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span style={{ color: CHAIN_COLORS[attestation.chainId as SupportedChainId] }}>
                  <ChainIcon chainId={attestation.chainId} className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-[family-name:var(--font-outfit)] text-sm font-medium text-foreground">
                    {getChainName(attestation.chainId)}
                  </p>
                  <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground">
                    {new Date(attestation.createdAt).toLocaleDateString()} · {attestation.signatureType}
                  </p>
                </div>
                {!attestation.verified && attestation.verificationError && (
                  <span className="font-[family-name:var(--font-outfit)] text-xs text-destructive">{attestation.verificationError}</span>
                )}
              </div>
              <button
                onClick={() => onUnlink(attestation.rkey)}
                disabled={deletingKey === attestation.rkey}
                className="text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors disabled:opacity-50"
                title="Unlink from this chain"
              >
                {deletingKey === attestation.rkey ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
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
        <Check className="size-3.5 text-create-accent" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
    </button>
  )
}
