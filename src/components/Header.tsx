'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AuthButton } from './AuthButton'

const navGroups = [
  {
    links: [
      { href: '/link', label: 'Wallets', matchAlso: ['/manage'] },
      { href: '/socials', label: 'Socials' },
    ],
  },
  {
    links: [
      { href: '/verify', label: 'Verify' },
      { href: '/docs', label: 'Docs' },
    ],
  },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  const isActive = (href: string, matchAlso?: string[]) => {
    if (pathname.startsWith(href)) return true
    if (matchAlso?.some(p => pathname.startsWith(p))) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMenu}>
            <Image
              src="/logo.png"
              alt="Identity Link"
              width={20}
              height={20}
              className="shrink-0 opacity-90"
            />
            <span className="font-[family-name:var(--font-garamond)] text-lg text-zinc-900 tracking-tight leading-none">
              Identity Link
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="ml-auto hidden md:flex items-center">
            {navGroups.map((group, gi) => (
              <div key={gi} className="flex items-center">
                {gi > 0 && <div className="w-px h-4 bg-zinc-200/80 mx-1.5" />}
                <div className="flex items-center gap-0.5">
                  {group.links.map(({ href, label, matchAlso }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                        isActive(href, matchAlso)
                          ? 'text-zinc-900 font-medium bg-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="w-px h-4 bg-zinc-200/80 mx-2" />
            <AuthButton />
          </nav>

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
          <div className="md:hidden pb-4 border-t border-zinc-100">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                {gi > 0 && <div className="h-px bg-zinc-100 my-1" />}
                <div className="flex flex-col gap-0.5 py-1">
                  {group.links.map(({ href, label, matchAlso }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenu}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(href, matchAlso)
                          ? 'bg-zinc-100 text-zinc-900 font-medium'
                          : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-2 pt-3 border-t border-zinc-100">
              <AuthButton variant="mobile" onNavigate={closeMenu} />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
