'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { getChainName, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import {
  WalletButton,
  CoinbaseIcon,
  MetaMaskIcon,
  WalletConnectIcon,
  SafeIcon,
} from '@/components/WalletButton'

interface WalletConnectStepProps {
  onContinue: () => void
}

export function WalletConnectStep({ onContinue }: WalletConnectStepProps) {
  const { session } = useAuth()
  const { address, isConnected, chain, connector } = useAccount()
  const { disconnect } = useDisconnect()

  // Connected state
  if (isConnected && address) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 dark:text-zinc-100">
            Wallet Connected
          </h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
            Ready to link to your ATProto identity
          </p>
        </div>

        {/* Linked identities preview */}
        <div className="space-y-2 mb-6">
          {/* ATProto identity */}
          <div className="flex items-center gap-3 py-3 px-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                @{session?.handle || session?.did}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">ATProto Identity</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center py-1">
            <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3 py-3 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <span 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: chain ? `${CHAIN_COLORS[chain.id as SupportedChainId]}15` : '#f4f4f5',
                color: chain ? CHAIN_COLORS[chain.id as SupportedChainId] : '#71717a',
              }}
            >
              {chain ? (
                <ChainIcon chainId={chain.id} className="w-4 h-4" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {chain ? getChainName(chain.id) : 'Unknown'}{connector && ` · ${connector.name}`}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg
                     hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Continue to Sign
        </button>
      </div>
    )
  }

  // Not connected state
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-garamond)] text-2xl text-zinc-900 dark:text-zinc-100">
          Connect Wallet
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
          Choose a wallet to link to your identity
        </p>
      </div>

      {/* Signed in indicator */}
      <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50 mb-6">
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span className="text-xs text-emerald-700 dark:text-emerald-400">
          Signed in as <span className="font-medium">@{session?.handle || session?.did}</span>
        </span>
      </div>

      {/* Wallet options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <WalletButton
          connectorId="injected"
          name="MetaMask"
          icon={<MetaMaskIcon />}
          description="Extension"
          recommended
        />
        <WalletButton
          connectorId="coinbaseWalletSDK"
          name="Coinbase"
          icon={<CoinbaseIcon />}
          description="Passkey"
        />
        <WalletButton
          connectorId="walletConnect"
          name="WalletConnect"
          icon={<WalletConnectIcon />}
          description="Mobile"
        />
        <WalletButton
          connectorId="safe"
          name="Safe"
          icon={<SafeIcon />}
          description="Multisig"
        />
      </div>
      
      {/* Rabby note */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mb-6">
        Using Rabby? Click MetaMask - works with all browser wallets.
      </p>

      {/* Security note */}
      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-3 text-xs">
          <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-zinc-400 dark:text-zinc-500">
            Read-only access. We can only view your address and request signatures. We cannot move your funds.
          </p>
        </div>
      </div>
    </div>
  )
}
