'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { AlertCircle, ShieldCheck, Loader2 } from 'lucide-react'

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
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-2xl text-foreground font-bold">
          Sign in with ATProto
        </h2>
        <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground mt-1">
          Connect your ATProto identity to prove who you are
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="handle" className="block text-xs font-[family-name:var(--font-outfit)] font-medium text-muted-foreground mb-1.5">
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
            className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg
                       placeholder:text-muted-foreground/50 text-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring
                       disabled:opacity-50 disabled:cursor-not-allowed
                       font-[family-name:var(--font-outfit)]
                       transition-all"
          />
          <p className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground mt-1.5">
            Enter your full handle (e.g. alice.bsky.social or alice.mydomain.com)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/30 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-[family-name:var(--font-outfit)]">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !handle.trim()}
          className="w-full py-2.5 px-4 bg-create-accent text-create-accent-foreground text-sm font-[family-name:var(--font-outfit)] font-semibold rounded-lg shadow-sm
                     hover:bg-create-accent/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      {/* Security note */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex gap-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
          <p className="font-[family-name:var(--font-outfit)] text-muted-foreground">
            You&apos;ll be redirected to your ATProto server to authorize. We never see your password.
          </p>
        </div>
      </div>
    </div>
  )
}
