'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900">
          Verify Identity
        </h1>
        <p className="text-zinc-500 mt-2">
          Check if an ATProto user has linked their wallet
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Handle or DID"
            className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-lg
                       text-sm text-zinc-800 placeholder-zinc-400
                       focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
                       transition-all"
          />
          <button
            onClick={handleLookup}
            disabled={isResolving || !input.trim()}
            className="px-5 py-3 bg-emerald-600 text-white font-medium rounded-lg
                       hover:bg-emerald-700 transition-colors
                       disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
          >
            {isResolving ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Examples */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className="text-xs text-zinc-400">Try:</span>
        {['pfrazee.com', 'jay.bsky.team', 'emily.bsky.team'].map((handle) => (
          <button
            key={handle}
            onClick={() => setInput(handle)}
            className="px-2.5 py-1 text-xs text-zinc-500 bg-zinc-100 rounded-full
                       hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
          >
            @{handle}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="mt-12 max-w-sm text-center">
        <p className="text-sm text-zinc-400">
          Verification checks that the wallet signature is cryptographically valid 
          and stored in the user&apos;s ATProto repository.
        </p>
      </div>
    </div>
  )
}
