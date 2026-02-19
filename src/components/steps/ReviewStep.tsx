'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAttestationSigning } from '@/hooks/useAttestationSigning'
import { getChainName, getExplorerUrl, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { SigningAnimation } from '@/components/SigningAnimation'
import { Check, CheckCircle, Settings, ShieldCheck, AlertCircle, ExternalLink, ChevronRight, ArrowLeftRight } from 'lucide-react'

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
        <div className="w-8 h-8 border-2 border-create-accent/20 border-t-create-accent rounded-full animate-spin mb-4" />
        <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground">Checking existing links...</p>
      </div>
    )
  }

  if (status === 'already-linked') {
    return (
      <div className="animate-fade-in-up">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl text-foreground font-bold">
            Already Linked
          </h2>
          <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground mt-1">
            This wallet is already connected on {getChainName(chainId)}
          </p>
        </div>

        {/* Wallet card */}
        <div className="p-4 glass-panel rounded-xl border border-border/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-create-accent/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-create-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-foreground truncate">
                {address}
              </p>
              <p className="text-xs font-[family-name:var(--font-outfit)] text-create-accent font-medium">
                Verified on {getChainName(chainId)}
              </p>
            </div>
            <a
              href={getExplorerUrl(chainId, address || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-create-accent/10 transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-secondary group-hover:bg-accent flex items-center justify-center transition-colors">
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground transition-colors">
              Connect a different wallet
            </span>
          </button>

          <Link
            href={`/verify/${session?.handle || session?.did}`}
            className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-secondary group-hover:bg-create-accent/10 flex items-center justify-center transition-colors">
              <CheckCircle className="w-4 h-4 text-muted-foreground group-hover:text-create-accent transition-colors" />
            </div>
            <span className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground group-hover:text-create-accent transition-colors">
              View verification page
            </span>
          </Link>

          <Link
            href="/manage"
            className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-secondary group-hover:bg-create-accent/10 flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-create-accent transition-colors" />
            </div>
            <span className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground group-hover:text-create-accent transition-colors">
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
        <div className="w-8 h-8 border-2 border-create-accent/20 border-t-create-accent rounded-full animate-spin mb-4" />
        <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground">Storing attestation...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-2xl text-foreground font-bold">
          Review & Sign
        </h2>
        <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground mt-1">
          Create a verifiable link between these identities
        </p>
      </div>

      {/* Link visualization */}
      <div className="space-y-2 mb-6">
        {/* ATProto identity */}
        <div className="flex items-center gap-3 py-3 px-4 glass-panel rounded-xl border border-border/50">
          <div className="w-8 h-8 rounded-full bg-create-accent/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-create-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground truncate">@{session?.handle}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{session?.did}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-1">
          <ArrowLeftRight className="w-4 h-4 text-create-accent" />
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3 py-3 px-4 glass-panel rounded-xl border border-border/50">
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
            <p className="font-mono text-sm text-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground">{getChainName(chainId)}</p>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2 py-2 px-3 bg-create-accent/10 rounded-lg border border-create-accent/20 mb-6">
        <ShieldCheck className="w-4 h-4 text-create-accent mt-0.5 shrink-0" />
        <p className="text-xs font-[family-name:var(--font-outfit)] text-create-accent">
          This signature only proves ownership. It cannot access your funds or make transactions.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/30 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-[family-name:var(--font-outfit)] text-destructive">{error}</p>
            <button
              onClick={() => { setStatus('idle'); setError(null) }}
              className="text-xs font-[family-name:var(--font-outfit)] text-destructive hover:text-destructive/80 underline mt-1"
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
          className="py-2.5 px-4 text-sm font-[family-name:var(--font-outfit)] font-medium text-muted-foreground hover:text-foreground transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleSign}
          disabled={isPending || status !== 'idle'}
          className="flex-1 py-2.5 px-4 bg-create-accent text-create-accent-foreground text-sm font-[family-name:var(--font-outfit)] font-semibold rounded-lg shadow-sm
                     hover:bg-create-accent/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {walletType === 'smart-wallet' ? 'Sign with Biometrics' : 'Sign & Link'}
        </button>
      </div>

      {/* Technical details */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <button
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-1 text-xs font-[family-name:var(--font-outfit)] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <ChevronRight
            className={`w-3 h-3 transition-transform ${showTechnical ? 'rotate-90' : ''}`}
          />
          Technical details
        </button>

        {showTechnical && (
          <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-[10px] text-muted-foreground overflow-x-auto">
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
