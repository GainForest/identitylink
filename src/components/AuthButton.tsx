'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { getChainName, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'

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
      <div className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-zinc-400 dark:border-zinc-700 dark:border-t-zinc-400 animate-spin" />
    )
  }

  if (isAuthenticated && session) {
    // Mobile: render profile + wallet + sign out inline (no dropdown)
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {session.avatar ? (
              <Image
                src={session.avatar}
                alt={session.handle}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 dark:text-zinc-400">
                {(session.displayName || session.handle).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate">{session.displayName || session.handle}</span>
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
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                </span>
              </div>
              <button
                onClick={handleWalletDisconnect}
                className="text-xs text-zinc-300 dark:text-zinc-600 hover:text-red-400 dark:hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
              Connect Wallet
            </button>
          )}
          
          <Link
            href={`/verify/${session.handle}`}
            onClick={onNavigate}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            My Links
          </Link>
          <button
            onClick={() => { onNavigate?.(); handleLogout() }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            Sign out
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
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
              {(session.displayName || session.handle).charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-zinc-600 dark:text-zinc-400 max-w-[120px] truncate">
            {session.displayName || session.handle}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg dark:shadow-zinc-900/50 border border-zinc-200/60 dark:border-zinc-700/60 py-1 z-50">
            {/* ATProto identity */}
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="text-[10px] uppercase tracking-wider text-zinc-300 dark:text-zinc-600 mb-1">ATProto</div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate" title={session.did}>
                {session.did.slice(0, 24)}...
              </div>
            </div>
            
            {/* EVM Wallet section */}
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="text-[10px] uppercase tracking-wider text-zinc-300 dark:text-zinc-600 mb-1.5">EVM Wallet</div>
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
                      <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate" title={evmAddress}>
                        {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                      </div>
                      <div className="text-[10px] text-zinc-300 dark:text-zinc-600 truncate">
                        {chain ? getChainName(chain.id) : ''}{connector ? ` · ${connector.name}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleWalletDisconnect}
                    className="text-[10px] text-zinc-300 dark:text-zinc-600 hover:text-red-400 dark:hover:text-red-400 transition-colors shrink-0"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowDropdown(false); setShowWalletModal(true) }}
                  className="flex items-center gap-2 w-full py-1.5 px-2 -mx-2 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Connect Wallet
                </button>
              )}
            </div>
            
            <Link
              href={`/verify/${session.handle}`}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My Links
            </Link>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
            <button
              onClick={() => { setShowDropdown(false); handleLogout() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
              Sign out
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
        className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
            className="relative w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg dark:shadow-zinc-900/50 border border-zinc-200/60 dark:border-zinc-700/60 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-garamond)] text-xl text-zinc-900 dark:text-zinc-100 mb-1">
              Sign in with ATProto
            </h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-5">
              Enter your handle to connect.
            </p>

            <form onSubmit={handleLogin}>
              <label htmlFor="auth-handle" className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">
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
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 rounded-lg
                           placeholder:text-zinc-300 dark:placeholder:text-zinc-600 dark:text-zinc-100
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1.5">
                Just a username? We&apos;ll add .bsky.social for you.
              </p>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg
                             hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !handle.trim()}
                  className="flex-1 px-3 py-2 text-sm text-white bg-emerald-600 rounded-lg
                             hover:bg-emerald-700 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
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
        <svg className="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      ),
    },
    coinbaseWalletSDK: {
      name: 'Coinbase',
      description: 'Smart Wallet with passkeys',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0052FF" />
          <path fillRule="evenodd" clipRule="evenodd" d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm-3.5 8a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-4z" fill="white" />
        </svg>
      ),
    },
    walletConnect: {
      name: 'WalletConnect',
      description: 'Mobile & desktop wallets',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#3B99FC" />
          <path d="M10.5 13c3-3 8-3 11 0l.4.4c.1.1.1.4 0 .5l-1.2 1.2c-.1.1-.2.1-.3 0l-.5-.5c-2.2-2.1-5.7-2.1-7.8 0l-.5.5c-.1.1-.2.1-.3 0l-1.2-1.2c-.2-.1-.2-.4 0-.5l.4-.4zm13.6 2.5l1.1 1c.2.2.2.4 0 .5l-4.8 4.7c-.2.2-.4.2-.6 0l-3.4-3.3c0-.1-.1-.1-.1 0l-3.4 3.3c-.2.2-.4.2-.6 0L7.5 17c-.2-.1-.2-.3 0-.5l1.1-1c.2-.2.4-.2.6 0l3.4 3.3c0 .1.1.1.1 0l3.4-3.3c.2-.2.4-.2.6 0l3.4 3.3c0 .1.1.1.1 0l3.4-3.3c.1-.2.4-.2.5 0z" fill="white" />
        </svg>
      ),
    },
    safe: {
      name: 'Safe',
      description: 'Multisig wallet',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#12FF80" />
          <path d="M16 6a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16z" fill="#121312" />
          <path d="M16 11a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" fill="#121312" />
        </svg>
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
        className="relative w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-lg dark:shadow-zinc-900/50 border border-zinc-200/60 dark:border-zinc-700/60 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-garamond)] text-xl text-zinc-900 dark:text-zinc-100">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="p-1 -mr-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-5">
          Choose a wallet to connect.
        </p>

        <div className="space-y-2">
          {availableWallets.map((connector) => {
            const info = walletInfo[connector.id]
            return (
              <button
                key={connector.id}
                onClick={() => onConnect(connector.id)}
                className="flex items-center gap-3 w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {info.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{info.name}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500">{info.description}</div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-zinc-300 dark:text-zinc-600 text-center mt-4">
          Read-only access. We cannot move your funds.
        </p>
      </div>
    </div>
  )
}
