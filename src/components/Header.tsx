'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Link2 } from 'lucide-react'
import { AuthButton } from './AuthButton'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/link', label: 'Link' },
  { href: '/verify', label: 'Verify' },
  { href: '/manage', label: 'Manage' },
  { href: '/docs', label: 'Docs' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 glass-panel">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0" onClick={closeMenu}>
            <div className="size-8 rounded-lg bg-create-accent/10 flex items-center justify-center">
              <Link2 className="size-4 text-create-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg sm:text-xl font-[family-name:var(--font-syne)] font-semibold text-foreground tracking-tight leading-none">
                Identity Link
              </h1>
              <span className="text-[11px] font-[family-name:var(--font-outfit)] text-muted-foreground font-normal tracking-wide uppercase hidden sm:inline">
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
                  className={`px-3 py-1 text-sm rounded transition-colors font-[family-name:var(--font-outfit)] ${
                    isActive(href)
                      ? 'bg-create-accent/10 text-create-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="w-px h-4 bg-border" />
            <ThemeToggle />
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
              className={`block w-4 h-[1.5px] bg-muted-foreground transition-all duration-200 ${
                isMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''
              }`}
            />
            <span
              className={`block w-4 h-[1.5px] bg-muted-foreground transition-all duration-200 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-4 h-[1.5px] bg-muted-foreground transition-all duration-200 ${
                isMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-3 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`px-3 py-2 text-sm rounded transition-colors font-[family-name:var(--font-outfit)] ${
                    isActive(href)
                      ? 'bg-create-accent/10 text-create-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <AuthButton variant="mobile" onNavigate={closeMenu} />
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between px-3">
              <span className="text-xs text-muted-foreground font-[family-name:var(--font-outfit)]">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
