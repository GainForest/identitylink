'use client'

import Link from 'next/link'
import { AuthButton } from './AuthButton'

export function Header() {
  return (
    <nav className="relative z-10 py-5 sm:py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg sm:text-xl font-medium text-zinc-800 tracking-tight leading-none">
                ATProto-EVM Link
              </h1>
              <span className="text-[11px] text-zinc-300 font-normal tracking-wide uppercase hidden sm:inline">
                Identity Bridge
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/link"
              className="px-3 py-1 text-sm rounded transition-colors text-zinc-400 hover:text-zinc-600"
            >
              Link
            </Link>
            <div className="w-px h-4 bg-zinc-200/60" />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
