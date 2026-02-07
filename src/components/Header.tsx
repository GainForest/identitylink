'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AuthButton } from './AuthButton'

const navLinks = [
  { href: '/link', label: 'Link' },
  { href: '/verify', label: 'Verify' },
  { href: '/manage', label: 'Manage' },
  { href: '/socials', label: 'Socials' },
  { href: '/docs', label: 'Docs' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="relative z-10 py-5 sm:py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0" onClick={closeMenu}>
            <Image
              src="/logo.png"
              alt="ATProto-EVM Link"
              width={22}
              height={22}
              className="shrink-0 opacity-90"
            />
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg sm:text-xl font-medium text-zinc-800 tracking-tight leading-none">
                Identity Link
              </h1>
              <span className="text-[11px] text-zinc-300 font-normal tracking-wide uppercase hidden sm:inline">
                ATProto ↔ EVM
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    isActive(href)
                      ? 'bg-zinc-100 text-zinc-900 font-medium'
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="w-px h-4 bg-zinc-200/60" />
            <AuthButton />
          </div>

          {/* Mobile Hamburger */}
          <button
            className="ml-auto md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span
              className={`block w-4 h-[1.5px] bg-zinc-500 transition-all duration-200 ${
                isMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''
              }`}
            />
            <span
              className={`block w-4 h-[1.5px] bg-zinc-500 transition-all duration-200 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-4 h-[1.5px] bg-zinc-500 transition-all duration-200 ${
                isMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-3 border-t border-zinc-100">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    isActive(href)
                      ? 'bg-zinc-100 text-zinc-900 font-medium'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <AuthButton variant="mobile" onNavigate={closeMenu} />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
