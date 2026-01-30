'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'

export function AtprotoAuthStep() {
  const { login, isLoading } = useAuth()
  const [handle, setHandle] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return

    setError('')
    try {
      await login(handle.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900">
          Sign in with ATProto
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Connect your ATProto identity to prove who you are
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="handle" className="block text-xs font-medium text-zinc-500 mb-1.5">
            Your Handle
          </label>
          <input
            id="handle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="alice.bsky.social"
            disabled={isLoading}
            autoFocus
            className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 rounded-lg
                       placeholder:text-zinc-300
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all"
          />
          <p className="text-xs text-zinc-400 mt-1.5">
            Enter your full handle (e.g. alice.bsky.social or alice.mydomain.com)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !handle.trim()}
          className="w-full py-2.5 px-4 bg-zinc-900 text-white text-sm font-medium rounded-lg
                     hover:bg-zinc-800 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      {/* Security note */}
      <div className="mt-6 pt-6 border-t border-zinc-100">
        <div className="flex gap-3 text-xs">
          <svg className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <p className="text-zinc-400">
            You&apos;ll be redirected to your ATProto server to authorize. We never see your password.
          </p>
        </div>
      </div>
    </div>
  )
}
