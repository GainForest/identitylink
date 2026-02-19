'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Loader2 } from 'lucide-react'

// Check if string is a DID
function isDid(value: string): boolean {
  return value.startsWith('did:')
}

export default function VerifyPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = useCallback(async () => {
    const cleaned = input.trim().replace(/^@/, '')
    if (!cleaned) return

    setError(null)
    setIsResolving(true)

    try {
      if (isDid(cleaned)) {
        router.push(`/verify/${encodeURIComponent(cleaned)}`)
        return
      }

      const res = await fetch(`/api/resolve-handle?handle=${encodeURIComponent(cleaned)}`)
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Could not resolve handle')
      }

      const data = await res.json()
      if (data.did) {
        router.push(`/verify/${encodeURIComponent(cleaned)}`)
      } else {
        throw new Error('Handle not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve')
      setIsResolving(false)
    }
  }, [input, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLookup()
  }

  return (
    <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
          Verify Identity
        </h1>
        <p className="font-[family-name:var(--font-outfit)] text-muted-foreground mt-2">
          Check if an ATProto user has linked their wallet
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl p-6 border border-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Handle or DID"
              className="flex-1 px-4 py-3 bg-background border border-input rounded-lg
                         text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring
                         font-[family-name:var(--font-outfit)] transition-all text-sm"
            />
            <button
              onClick={handleLookup}
              disabled={isResolving || !input.trim()}
              className="px-5 py-3 bg-create-accent text-create-accent-foreground font-semibold rounded-lg
                         hover:bg-create-accent/90 transition-colors shadow-sm
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-[family-name:var(--font-outfit)]"
            >
              {isResolving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <p className="font-[family-name:var(--font-outfit)] text-sm text-destructive mt-3 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className="text-xs text-muted-foreground font-[family-name:var(--font-outfit)]">Try:</span>
        {['pfrazee.com', 'jay.bsky.team', 'emily.bsky.team'].map((handle) => (
          <button
            key={handle}
            onClick={() => setInput(handle)}
            className="px-2.5 py-1 text-xs text-muted-foreground bg-secondary rounded-full
                       hover:bg-secondary/80 hover:text-foreground transition-colors
                       font-[family-name:var(--font-outfit)]"
          >
            @{handle}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="mt-12 max-w-sm text-center">
        <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground">
          Verification checks that the wallet signature is cryptographically valid 
          and stored in the user&apos;s ATProto repository.
        </p>
      </div>
    </div>
  )
}
