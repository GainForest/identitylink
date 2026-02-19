'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { getChainName, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { User, LogOut, LogIn, Wallet, Plus, X } from 'lucide-react'

interface AuthButtonProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export function AuthButton({ variant = 'desktop', onNavigate }: AuthButtonProps) {
  const { isAuthenticated, isLoading, session, login, logout } = useAuth()
  const { address: evmAddress, chain, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [handle, setHandle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      await login(handle.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleWalletConnect = (connectorId: string) => {
    const selectedConnector = connectors.find(c => c.id === connectorId)
    if (selectedConnector) {
      connect({ connector: selectedConnector })
      setShowWalletModal(false)
    }
  }

  const handleWalletDisconnect = () => {
    disconnect()
  }

  if (isLoading) {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-border border-t-muted-foreground animate-spin" />
    )
  }

  if (isAuthenticated && session) {
    // Mobile: render profile + wallet + sign out inline (no dropdown)
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
            {session.avatar ? (
              <Image
                src={session.avatar}
                alt={session.handle}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground">
                {(session.displayName || session.handle).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate font-[family-name:var(--font-outfit)]">{session.displayName || session.handle}</span>
          </div>
          
          {/* Mobile wallet section */}
          {evmAddress ? (
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                {chain && (
                  <span 
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${CHAIN_COLORS[chain.id as SupportedChainId]}20`,
                    }}
                  >
                    <ChainIcon chainId={chain.id} className="w-2.5 h-2.5" />
                  </span>
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleWalletDisconnect}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Wallet className="size-4" />
              <span className="font-[family-name:var(--font-outfit)]">Connect Wallet</span>
            </button>
          )}
          
          <Link
            href={`/verify/${session.handle}`}
            onClick={onNavigate}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <User className="size-4 text-muted-foreground" />
            <span className="font-[family-name:var(--font-outfit)]">My Links</span>
          </Link>
          <button
            onClick={() => { onNavigate?.(); handleLogout() }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
          >
            <LogOut className="size-4 text-muted-foreground" />
            <span className="font-[family-name:var(--font-outfit)]">Sign out</span>
          </button>
          
          {/* Mobile wallet modal */}
          {showWalletModal && (
            <WalletModal 
              onClose={() => setShowWalletModal(false)} 
              onConnect={handleWalletConnect}
              connectors={connectors}
            />
          )}
        </div>
      )
    }

    // Desktop: dropdown
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {session.avatar ? (
            <Image
              src={session.avatar}
              alt={session.handle}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
              {(session.displayName || session.handle).charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-muted-foreground max-w-[120px] truncate font-[family-name:var(--font-outfit)]">
            {session.displayName || session.handle}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg shadow-lg border border-border/50 py-1 z-50">
            {/* ATProto identity */}
            <div className="px-3 py-2 border-b border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ATProto</div>
              <div className="text-xs text-muted-foreground truncate" title={session.did}>
                {session.did.slice(0, 24)}...
              </div>
            </div>
            
            {/* EVM Wallet section */}
            <div className="px-3 py-2 border-b border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">EVM Wallet</div>
              {evmAddress ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {chain && (
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ 
                          backgroundColor: `${CHAIN_COLORS[chain.id as SupportedChainId]}15`,
                        }}
                      >
                        <ChainIcon chainId={chain.id} className="w-3 h-3" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-muted-foreground truncate" title={evmAddress}>
                        {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {chain ? getChainName(chain.id) : ''}{connector ? ` · ${connector.name}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleWalletDisconnect}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowDropdown(false); setShowWalletModal(true) }}
                  className="flex items-center gap-2 w-full py-1.5 px-2 -mx-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span className="font-[family-name:var(--font-outfit)]">Connect Wallet</span>
                </button>
              )}
            </div>
            
            <Link
              href={`/verify/${session.handle}`}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <User className="size-4 text-muted-foreground" />
              <span className="font-[family-name:var(--font-outfit)]">My Links</span>
            </Link>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { setShowDropdown(false); handleLogout() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut className="size-4 text-muted-foreground" />
              <span className="font-[family-name:var(--font-outfit)]">Sign out</span>
            </button>
          </div>
        )}

        {/* Wallet connect modal */}
        {showWalletModal && (
          <WalletModal 
            onClose={() => setShowWalletModal(false)} 
            onConnect={handleWalletConnect}
            connectors={connectors}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap shrink-0 font-[family-name:var(--font-outfit)]"
      >
        Sign in
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-sm mx-4 bg-card rounded-xl shadow-lg border border-border/50 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-outfit)] text-xl text-foreground mb-1">
              Sign in with ATProto
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Enter your handle to connect.
            </p>

            <form onSubmit={handleLogin}>
              <label htmlFor="auth-handle" className="block text-sm text-muted-foreground mb-1.5 font-[family-name:var(--font-outfit)]">
                Handle
              </label>
              <input
                id="auth-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="alice.bsky.social"
                disabled={isSubmitting}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-card border border-border/50 rounded-lg
                           placeholder:text-muted-foreground text-foreground
                           focus:outline-none focus:ring-2 focus:ring-create-accent/30 focus:border-create-accent
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Just a username? We&apos;ll add .bsky.social for you.
              </p>

              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg
                             hover:bg-secondary transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-outfit)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !handle.trim()}
                  className="flex-1 px-3 py-2 text-sm text-create-accent-foreground bg-create-accent rounded-lg
                             hover:bg-create-accent/90 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-outfit)]"
                >
                  {isSubmitting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// Wallet selection modal component
interface WalletModalProps {
  onClose: () => void
  onConnect: (connectorId: string) => void
  connectors: readonly { id: string; name: string }[]
}

function WalletModal({ onClose, onConnect, connectors }: WalletModalProps) {
  // Map connector IDs to display info
  const walletInfo: Record<string, { name: string; icon: React.ReactNode; description: string }> = {
    injected: {
      name: 'Browser Wallet',
      description: 'MetaMask, Rabby, etc.',
      icon: (
        <Wallet className="size-6 text-muted-foreground" />
      ),
    },
    coinbaseWalletSDK: {
      name: 'Coinbase',
      description: 'Smart Wallet with passkeys',
      icon: (
        <Wallet className="size-6 text-[#0052FF]" />
      ),
    },
    walletConnect: {
      name: 'WalletConnect',
      description: 'Mobile & desktop wallets',
      icon: (
        <Wallet className="size-6 text-[#3B99FC]" />
      ),
    },
    safe: {
      name: 'Safe',
      description: 'Multisig wallet',
      icon: (
        <Wallet className="size-6 text-[#12FF80]" />
      ),
    },
  }

  // Filter to only show connectors we have info for and that are available
  const availableWallets = connectors.filter(c => walletInfo[c.id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 bg-card rounded-xl shadow-lg border border-border/50 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-outfit)] text-xl text-foreground">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-1 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-5">
          Choose a wallet to connect.
        </p>

        <div className="space-y-2">
          {availableWallets.map((connector) => {
            const info = walletInfo[connector.id]
            return (
              <button
                key={connector.id}
                onClick={() => onConnect(connector.id)}
                className="flex items-center gap-3 w-full p-3 rounded-lg border border-border hover:border-border/50 hover:bg-muted transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {info.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground font-[family-name:var(--font-outfit)]">{info.name}</div>
                  <div className="text-xs text-muted-foreground">{info.description}</div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Read-only access. We cannot move your funds.
        </p>
      </div>
    </div>
  )
}
