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
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-400 rounded-full animate-spin" />
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 dark:text-zinc-100">
                  Wallet Linked
                </h2>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
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
                className="flex items-center gap-3 py-3 px-4 -mx-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30"
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
                  <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200 truncate">
                    {wallet.address}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {getChainName(wallet.chainId)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(wallet.address, wallet.address)}
                    className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    title="Copy address"
                  >
                    {copiedField === wallet.address ? (
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                    )}
                  </button>
                  <a
                    href={getExplorerUrl(wallet.chainId, wallet.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    title="View on explorer"
                  >
                    <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLinkAnother}
              className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 dark:text-zinc-500 dark:group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-base font-medium text-zinc-800 group-hover:text-emerald-700 dark:text-zinc-200 dark:group-hover:text-emerald-400 transition-colors">
                Link another wallet
              </span>
            </button>

            <Link
              href={`/verify/${session?.handle || session?.did}`}
              className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 dark:text-zinc-500 dark:group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-base font-medium text-zinc-800 group-hover:text-emerald-700 dark:text-zinc-200 dark:group-hover:text-emerald-400 transition-colors">
                View verification page
              </span>
            </Link>

            <Link
              href="/manage"
              className="group flex items-center gap-3 w-full py-3 px-4 -mx-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 dark:text-zinc-500 dark:group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-base font-medium text-zinc-800 group-hover:text-emerald-700 dark:text-zinc-200 dark:group-hover:text-emerald-400 transition-colors">
                Manage linked wallets
              </span>
            </Link>
          </div>

          {/* Share link */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Share your verification link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyUrl}
                readOnly
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 font-mono truncate"
              />
              <button
                onClick={() => handleCopy(verifyUrl, 'verifyUrl')}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                  copiedField === 'verifyUrl'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {copiedField === 'verifyUrl' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Technical details */}
          {latestWallet && (
            <details className="mt-4 text-xs">
              <summary className="text-zinc-300 hover:text-zinc-400 dark:text-zinc-600 dark:hover:text-zinc-500 cursor-pointer">
                Technical details
              </summary>
              <p className="mt-2 font-mono text-zinc-400 dark:text-zinc-500 break-all bg-zinc-50 dark:bg-zinc-800 p-2 rounded">
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
          <h2 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
            Link Identity
          </h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
            Connect your ATProto DID to an Ethereum wallet
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 text-xs">
          <span className={currentStep === 'atproto' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-300 dark:text-zinc-600'}>
            Sign in
          </span>
          <svg className="w-4 h-4 text-zinc-200 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className={currentStep === 'wallet' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-300 dark:text-zinc-600'}>
            Connect wallet
          </span>
          <svg className="w-4 h-4 text-zinc-200 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className={currentStep === 'review' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-300 dark:text-zinc-600'}>
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
