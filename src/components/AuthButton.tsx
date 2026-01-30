'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAccount } from 'wagmi'

interface AuthButtonProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export function AuthButton({ variant = 'desktop', onNavigate }: AuthButtonProps) {
  const { isAuthenticated, isLoading, session, login, logout } = useAuth()
  const { address: evmAddress } = useAccount()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
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

  if (isLoading) {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-zinc-400 animate-spin" />
    )
  }

  if (isAuthenticated && session) {
    // Mobile: render profile + sign out inline (no dropdown)
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500">
            {session.avatar ? (
              <Image
                src={session.avatar}
                alt={session.handle}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-500">
                {(session.displayName || session.handle).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate">{session.displayName || session.handle}</span>
          </div>
          <Link
            href={`/verify/${session.handle}`}
            onClick={onNavigate}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            My Links
          </Link>
          <button
            onClick={() => { onNavigate?.(); handleLogout() }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            Sign out
          </button>
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
            <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs text-zinc-500">
              {(session.displayName || session.handle).charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-zinc-600 max-w-[120px] truncate">
            {session.displayName || session.handle}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-zinc-200/60 py-1 z-50">
            <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-100 space-y-1">
              <div className="truncate" title={session.did}>{session.did.slice(0, 20)}...</div>
              {evmAddress && (
                <div className="truncate text-zinc-300" title={evmAddress}>
                  {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                </div>
              )}
            </div>
            <Link
              href={`/verify/${session.handle}`}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My Links
            </Link>
            <div className="h-px bg-zinc-100 my-1" />
            <button
              onClick={() => { setShowDropdown(false); handleLogout() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
            className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-lg border border-zinc-200/60 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-[family-name:var(--font-garamond)] text-xl text-zinc-900 mb-1">
              Sign in with ATProto
            </h2>
            <p className="text-sm text-zinc-400 mb-5">
              Enter your handle to connect.
            </p>

            <form onSubmit={handleLogin}>
              <label htmlFor="auth-handle" className="block text-sm text-zinc-600 mb-1.5">
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
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200/60 rounded-lg
                           placeholder:text-zinc-300
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-zinc-300 mt-1.5">
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
                  className="flex-1 px-3 py-2 text-sm text-zinc-600 bg-zinc-50 rounded-lg
                             hover:bg-zinc-100 transition-colors
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
