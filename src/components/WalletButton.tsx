'use client'

import { useConnect } from 'wagmi'

interface WalletButtonProps {
  connectorId: string
  name: string
  icon: React.ReactNode
  description?: string
  recommended?: boolean
  onClick?: () => void
}

export function WalletButton({
  connectorId,
  name,
  icon,
  description,
  recommended,
  onClick,
}: WalletButtonProps) {
  const { connect, connectors, isPending } = useConnect()
  
  const connector = connectors.find(c => c.id === connectorId)
  const isConnecting = isPending

  const handleClick = () => {
    if (connector) {
      connect({ connector })
    }
    onClick?.()
  }

  if (!connector) return null

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 
        transition-all duration-200 cursor-pointer
        ${recommended 
          ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30' 
          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          Recommended
        </span>
      )}
      
      <div className="w-10 h-10 mb-2 flex items-center justify-center">
        {icon}
      </div>
      
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{name}</span>
      
      {description && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{description}</span>
      )}
    </button>
  )
}

// Pre-configured wallet icons
export function CoinbaseIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0052FF" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm-3.5 8a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-4z"
        fill="white"
      />
    </svg>
  )
}

export function MetaMaskIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <path d="M27.2 4L17.5 11.3l1.8-4.2L27.2 4z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.8 4l9.6 7.4-1.7-4.3L4.8 4zM23.8 21.8l-2.6 3.9 5.5 1.5 1.6-5.3-4.5-.1zM3.7 21.9l1.6 5.3 5.5-1.5-2.6-3.9-4.5.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 14.5L9 16.8l5.5.2-.2-5.9-3.8 3.4zM21.5 14.5l-3.9-3.5-.1 6 5.5-.2-1.5-2.3zM10.8 25.7l3.3-1.6-2.9-2.2-.4 3.8zM17.9 24.1l3.3 1.6-.4-3.8-2.9 2.2z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.2 25.7l-3.3-1.6.3 2.1v.9l3-1.4zM10.8 25.7l3 1.4v-.9l.2-2.1-3.2 1.6z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.9 20.4l-2.8-.8 2-1 .8 1.8zM18.1 20.4l.8-1.8 2 1-2.8.8z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8 25.7l.4-4-3 .1 2.6 3.9zM20.8 21.7l.4 4 2.6-3.9-3-.1zM23 16.8l-5.5.2.5 3.4.8-1.8 2 1 2.2-2.8zM11.1 19.6l2-1 .8 1.8.5-3.4-5.5-.2 2.2 2.8z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 16.8l2.3 4.5-.1-2.1L9 16.8zM20.8 19.2l-.1 2.1 2.3-4.5-2.2 2.4zM14.5 17l-.5 3.4.6 3.2.2-4.3-.3-2.3zM17.5 17l-.3 2.3.1 4.3.7-3.2-.5-3.4z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 20.4l-.7 3.2.5.3 2.9-2.2.1-2.1-2.8.8zM11.1 19.6l.1 2.1 2.9 2.2.5-.3-.6-3.2-2.9-.8z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.1 27.1v-.9l-.3-.2h-3.7l-.2.2v.9l-3-1.4 1.1.9 2.1 1.5h3.8l2.1-1.5 1.1-.9-3 1.4z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.9 24.1l-.5-.3h-2.8l-.5.3-.2 2.1.2-.2h3.7l.3.2-.2-2.1z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.7 11.8l.8-3.9L27.2 4l-9.3 6.9 3.6 3 5.1 1.5 1.1-1.3-.5-.4.8-.7-.6-.5.8-.6-.5-.1zM3.5 7.9l.8 3.9-.5.4.8.6-.6.5.8.7-.5.4 1.1 1.3 5.1-1.5 3.6-3L4.8 4 3.5 7.9z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26.6 15.4l-5.1-1.5 1.5 2.3-2.3 4.5 3.1-.1h4.5l-1.7-5.2zM10.5 13.9l-5.1 1.5-1.7 5.2h4.5l3-.1-2.2-4.5 1.5-2.1zM17.5 17l.3-5.1 1.5-4h-6.7l1.4 4 .4 5.1.1 2.3v4.3h2.8l.1-4.3.1-2.3z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WalletConnectIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#3B99FC" />
      <path
        d="M10.5 13c3-3 8-3 11 0l.4.4c.1.1.1.4 0 .5l-1.2 1.2c-.1.1-.2.1-.3 0l-.5-.5c-2.2-2.1-5.7-2.1-7.8 0l-.5.5c-.1.1-.2.1-.3 0l-1.2-1.2c-.2-.1-.2-.4 0-.5l.4-.4zm13.6 2.5l1.1 1c.2.2.2.4 0 .5l-4.8 4.7c-.2.2-.4.2-.6 0l-3.4-3.3c0-.1-.1-.1-.1 0l-3.4 3.3c-.2.2-.4.2-.6 0L7.5 17c-.2-.1-.2-.3 0-.5l1.1-1c.2-.2.4-.2.6 0l3.4 3.3c0 .1.1.1.1 0l3.4-3.3c.2-.2.4-.2.6 0l3.4 3.3c0 .1.1.1.1 0l3.4-3.3c.1-.2.4-.2.5 0z"
        fill="white"
      />
    </svg>
  )
}

export function SafeIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#12FF80" />
      <path
        d="M16 6a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16z"
        fill="#121312"
      />
      <path
        d="M16 11a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"
        fill="#121312"
      />
    </svg>
  )
}

export function RabbyIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#rabby-gradient)" />
      <path
        d="M22.5 12.5c0-2.5-2-4.5-4.5-4.5h-4c-2.5 0-4.5 2-4.5 4.5v2c0 .8.2 1.6.6 2.2l-.6 4.8c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5l.4-3.2c.6.4 1.3.7 2.1.7h4c2.5 0 4.5-2 4.5-4.5v-2z"
        fill="white"
      />
      <circle cx="12.5" cy="12" r="1.5" fill="#8697FF" />
      <circle cx="19.5" cy="12" r="1.5" fill="#8697FF" />
      <defs>
        <linearGradient id="rabby-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8697FF" />
          <stop offset="1" stopColor="#6B7AED" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function InjectedIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`${className} rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center`}>
      <svg className="w-6 h-6 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    </div>
  )
}
