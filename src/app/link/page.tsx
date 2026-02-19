'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAccount, useDisconnect, useAccountEffect } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { getChainName, getExplorerUrl, sortByChainId, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { AtprotoAuthStep } from '@/components/steps/AtprotoAuthStep'
import { WalletConnectStep } from '@/components/steps/WalletConnectStep'
import { ReviewStep } from '@/components/steps/ReviewStep'
import { ChevronRight, Check, Copy, ExternalLink, Plus, CheckCircle, Settings } from 'lucide-react'

type Step = 'atproto' | 'wallet' | 'review' | 'success'

interface LinkedWallet {
  address: string
  chainId: number
  uri: string
}

export default function LinkPage() {
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([])
  const [manualStep, setManualStep] = useState<Step | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false)
  const previousAddressRef = useRef<string | undefined>(undefined)
  
  const { session, isAuthenticated, isLoading: authLoading } = useAuth()
  const { address, chain, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  // Handle account changes - when user switches wallet in extension
  useAccountEffect({
    onConnect({ address: newAddress }) {
      // If we had a previous address and it changed, go back to review step
      if (previousAddressRef.current && previousAddressRef.current !== newAddress) {
        // Reset to review step to re-verify the new wallet
        if (manualStep === 'success') {
          setManualStep('review')
        }
      }
      previousAddressRef.current = newAddress
    },
    onDisconnect() {
      previousAddressRef.current = undefined
      // If we were in success state, stay there (they already linked)
      // Otherwise go back to wallet step
      if (manualStep !== 'success') {
        setManualStep('wallet')
      }
    },
  })
  
  // Track address changes for connected state
  useEffect(() => {
    if (address) {
      previousAddressRef.current = address
    }
  }, [address])

  // Check for existing linked wallets on mount
  useEffect(() => {
    if (!session?.did || hasCheckedExisting) return

    const checkExisting = async () => {
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(session.did)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.attestations && data.attestations.length > 0) {
            // Convert to LinkedWallet format
            const wallets: LinkedWallet[] = data.attestations.map((a: { address: string; chainId: number; rkey: string }) => ({
              address: a.address,
              chainId: a.chainId,
              uri: `at://${session.did}/org.impactindexer.link.attestation/${a.rkey}`,
            }))
            setLinkedWallets(wallets)
            setManualStep('success')
          }
        }
      } catch {
        // Silently fail - just proceed with normal flow
      } finally {
        setHasCheckedExisting(true)
      }
    }

    checkExisting()
  }, [session?.did, hasCheckedExisting])

  // Determine current step based on state
  const currentStep: Step = (() => {
    if (manualStep === 'success') return 'success'
    if (manualStep) return manualStep
    if (isAuthenticated && isConnected) return 'review'
    if (isAuthenticated) return 'wallet'
    return 'atproto'
  })()

  const handleSuccess = useCallback((uri: string) => {
    if (address && chain) {
      setLinkedWallets(prev => [...prev, { address, chainId: chain.id, uri }])
    }
    setManualStep('success')
  }, [address, chain])

  const handleLinkAnother = useCallback(() => {
    disconnect()
    setManualStep('wallet')
  }, [disconnect])

  const handleCopy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback
    }
  }, [])

  // Loading state
  if (authLoading || (isAuthenticated && !hasCheckedExisting)) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-create-accent/20 border-t-create-accent rounded-full animate-spin" />
      </div>
    )
  }

  // Success state - clean minimal design
  if (currentStep === 'success') {
    const sortedWallets = sortByChainId(linkedWallets)
    const latestWallet = linkedWallets[linkedWallets.length - 1]
    const verifyUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/verify/${session?.handle || session?.did}`
      : ''

    return (
      <div className="pt-12 sm:pt-20 pb-16">
        <div className="max-w-md mx-auto">
          {/* Success header */}
          <div className="mb-8 glass-panel rounded-2xl p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-create-accent/10 flex items-center justify-center animate-scale-in">
                <Check className="size-5 text-create-accent" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-syne)] text-2xl text-foreground font-bold">
                  Wallet Linked
                </h2>
                <p className="text-sm text-muted-foreground">
                  {linkedWallets.length} wallet{linkedWallets.length > 1 ? 's' : ''} connected to @{session?.handle}
                </p>
              </div>
            </div>
          </div>

          {/* Linked wallets list */}
          <div className="space-y-3 mb-8">
            {sortedWallets.map((wallet) => (
              <div 
                key={wallet.uri}
                className="flex items-center gap-3 py-3 px-4 -mx-4 rounded-lg bg-create-accent/5"
              >
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${CHAIN_COLORS[wallet.chainId as SupportedChainId]}15`,
                    color: CHAIN_COLORS[wallet.chainId as SupportedChainId],
                  }}
                >
                  <ChainIcon chainId={wallet.chainId} className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-foreground truncate">
                    {wallet.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getChainName(wallet.chainId)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(wallet.address, wallet.address)}
                    className="p-1.5 rounded hover:bg-create-accent/10 transition-colors"
                    title="Copy address"
                  >
                    {copiedField === wallet.address ? (
                      <Check className="w-4 h-4 text-create-accent" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <a
                    href={getExplorerUrl(wallet.chainId, wallet.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-create-accent/10 transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLinkAnother}
              className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="size-8 rounded-full bg-secondary group-hover:bg-create-accent/10 flex items-center justify-center transition-colors">
                <Plus className="size-4 text-muted-foreground group-hover:text-create-accent transition-colors" />
              </div>
              <span className="text-base font-[family-name:var(--font-outfit)] font-medium text-foreground group-hover:text-create-accent transition-colors">
                Link another wallet
              </span>
            </button>

            <Link
              href={`/verify/${session?.handle || session?.did}`}
              className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="size-8 rounded-full bg-secondary group-hover:bg-create-accent/10 flex items-center justify-center transition-colors">
                <CheckCircle className="size-4 text-muted-foreground group-hover:text-create-accent transition-colors" />
              </div>
              <span className="text-base font-[family-name:var(--font-outfit)] font-medium text-foreground group-hover:text-create-accent transition-colors">
                View verification page
              </span>
            </Link>

            <Link
              href="/manage"
              className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="size-8 rounded-full bg-secondary group-hover:bg-create-accent/10 flex items-center justify-center transition-colors">
                <Settings className="size-4 text-muted-foreground group-hover:text-create-accent transition-colors" />
              </div>
              <span className="text-base font-[family-name:var(--font-outfit)] font-medium text-foreground group-hover:text-create-accent transition-colors">
                Manage linked wallets
              </span>
            </Link>
          </div>

          {/* Share link */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Share your verification link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyUrl}
                readOnly
                className="flex-1 px-3 py-2 text-xs bg-muted border border-border rounded-lg text-muted-foreground font-mono truncate"
              />
              <button
                onClick={() => handleCopy(verifyUrl, 'verifyUrl')}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                  copiedField === 'verifyUrl'
                    ? 'bg-create-accent/10 text-create-accent'
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                {copiedField === 'verifyUrl' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Technical details */}
          {latestWallet && (
            <details className="mt-4 text-xs">
              <summary className="text-muted-foreground/50 hover:text-muted-foreground cursor-pointer">
                Technical details
              </summary>
              <p className="mt-2 font-mono text-muted-foreground break-all bg-muted p-2 rounded">
                {latestWallet.uri}
              </p>
            </details>
          )}
        </div>
      </div>
    )
  }

  // Linking flow
  return (
    <div className="pt-12 sm:pt-20 pb-16">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
            Link Identity
          </h2>
          <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground mt-1">
            Connect your ATProto DID to an Ethereum wallet
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 text-xs">
          <span className={currentStep === 'atproto' ? 'text-create-accent font-[family-name:var(--font-outfit)] font-medium' : 'text-muted-foreground/50 font-[family-name:var(--font-outfit)]'}>
            Sign in
          </span>
          <ChevronRight className="size-4 text-border" />
          <span className={currentStep === 'wallet' ? 'text-create-accent font-[family-name:var(--font-outfit)] font-medium' : 'text-muted-foreground/50 font-[family-name:var(--font-outfit)]'}>
            Connect wallet
          </span>
          <ChevronRight className="size-4 text-border" />
          <span className={currentStep === 'review' ? 'text-create-accent font-[family-name:var(--font-outfit)] font-medium' : 'text-muted-foreground/50 font-[family-name:var(--font-outfit)]'}>
            Sign & link
          </span>
        </div>

        {/* Step content */}
        {currentStep === 'atproto' && (
          <AtprotoAuthStep />
        )}
        
        {currentStep === 'wallet' && (
          <WalletConnectStep 
            onContinue={() => setManualStep('review')} 
          />
        )}
        
        {currentStep === 'review' && (
          <ReviewStep
            onSuccess={handleSuccess}
            onBack={() => setManualStep('wallet')}
          />
        )}
      </div>
    </div>
  )
}
