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
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
          Sign in with Bluesky
        </h1>
        <p className="text-zinc-500">
          First, connect your ATProto identity to prove who you are.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="handle" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Your Bluesky Handle
          </label>
          <input
            id="handle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="alice.bsky.social"
            disabled={isLoading}
            autoFocus
            className="w-full px-4 py-3 text-base bg-white border border-zinc-200 rounded-xl
                       placeholder:text-zinc-300
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-sm text-zinc-400 mt-1.5">
            Just enter your username and we&apos;ll add .bsky.social automatically
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !handle.trim()}
          className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl
                     hover:bg-emerald-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </span>
          ) : (
            'Continue with Bluesky'
          )}
        </button>
      </form>

      {/* Security note */}
      <div className="flex gap-3 p-4 bg-zinc-50 rounded-xl text-sm">
        <svg className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div className="text-zinc-600">
          <p className="font-medium">Secure authentication</p>
          <p className="text-zinc-500 mt-0.5">
            You&apos;ll be redirected to your ATProto server to authorize this app. We never see your password.
          </p>
        </div>
      </div>
    </div>
  )
}
