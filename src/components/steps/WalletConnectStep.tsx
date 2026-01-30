'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { getChainName } from '@/lib/chains'
import {
  WalletButton,
  CoinbaseIcon,
  MetaMaskIcon,
  WalletConnectIcon,
  SafeIcon,
  InjectedIcon,
} from '@/components/WalletButton'

interface WalletConnectStepProps {
  onContinue: () => void
}

export function WalletConnectStep({ onContinue }: WalletConnectStepProps) {
  const { session } = useAuth()
  const { address, isConnected, chain, connector } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
            Wallet Connected
          </h1>
          <p className="text-zinc-500">
            Great! Your wallet is ready to be linked.
          </p>
        </div>

        {/* Connected wallet card */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">Connected Wallet</span>
            <button
              onClick={() => disconnect()}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-sm text-zinc-800">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs text-zinc-500">
                {chain ? getChainName(chain.id) : 'Unknown Chain'}
                {connector && ` • ${connector.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* ATProto identity reminder */}
        <div className="p-4 bg-zinc-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">🦋</span>
            </div>
            <div>
              <p className="font-medium text-zinc-800">
                @{session?.handle || session?.did}
              </p>
              <p className="text-xs text-zinc-500">Bluesky Identity</p>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl
                     hover:bg-blue-700 transition-colors"
        >
          Continue to Review
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
          Connect Your Wallet
        </h1>
        <p className="text-zinc-500">
          Choose the wallet you want to link to your Bluesky identity.
        </p>
      </div>

      {/* ATProto identity reminder */}
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <div>
          <span className="text-sm text-green-800">Signed in as </span>
          <span className="text-sm font-medium text-green-900">
            @{session?.handle || session?.did}
          </span>
        </div>
      </div>

      {/* Wallet options */}
      <div className="grid grid-cols-2 gap-3">
        <WalletButton
          connectorId="coinbaseWalletSDK"
          name="Coinbase"
          icon={<CoinbaseIcon />}
          description="Passkey"
          recommended
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
        <WalletButton
          connectorId="injected"
          name="Browser"
          icon={<InjectedIcon />}
          description="Extension"
        />
      </div>

      {/* Security note */}
      <div className="flex gap-3 p-4 bg-zinc-50 rounded-xl text-sm">
        <svg className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <div className="text-zinc-600">
          <p className="font-medium">Read-only access</p>
          <p className="text-zinc-500 mt-0.5">
            We only request permission to view your address and request signatures. We cannot move your funds.
          </p>
        </div>
      </div>
    </div>
  )
}
