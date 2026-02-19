'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { getChainName, CHAIN_COLORS, type SupportedChainId } from '@/lib/chains'
import { ChainIcon } from '@/components/ChainIcons'
import { Check, Lock, ArrowDown, Wallet } from 'lucide-react'
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
      <div className="animate-fade-in-up">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl text-foreground font-bold">
            Wallet Connected
          </h2>
          <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground mt-1">
            Ready to link to your ATProto identity
          </p>
        </div>

        {/* Linked identities preview */}
        <div className="space-y-2 mb-6">
          {/* ATProto identity */}
          <div className="flex items-center gap-3 py-3 px-4 glass-panel rounded-xl border border-border/50">
            <div className="w-8 h-8 rounded-full bg-create-accent/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-create-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-[family-name:var(--font-outfit)] font-medium text-foreground truncate">
                @{session?.handle || session?.did}
              </p>
              <p className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground">ATProto Identity</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center py-1">
            <ArrowDown className="w-4 h-4 text-border" />
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3 py-3 px-4 glass-panel rounded-xl border border-border/50">
            <span 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: chain ? `${CHAIN_COLORS[chain.id as SupportedChainId]}15` : undefined,
                color: chain ? CHAIN_COLORS[chain.id as SupportedChainId] : undefined,
              }}
            >
              {chain ? (
                <ChainIcon chainId={chain.id} className="w-4 h-4" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground">
                {chain ? getChainName(chain.id) : 'Unknown'}{connector && ` · ${connector.name}`}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground hover:text-destructive transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full py-2.5 px-4 bg-create-accent text-create-accent-foreground text-sm font-[family-name:var(--font-outfit)] font-semibold rounded-lg shadow-sm
                     hover:bg-create-accent/90 transition-colors"
        >
          Continue to Sign
        </button>
      </div>
    )
  }

  // Not connected state
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-2xl text-foreground font-bold">
          Connect Wallet
        </h2>
        <p className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground mt-1">
          Choose a wallet to link to your identity
        </p>
      </div>

      {/* Signed in indicator */}
      <div className="flex items-center gap-2 py-2 px-3 bg-create-accent/10 rounded-lg border border-create-accent/20 mb-6">
        <Check className="w-4 h-4 text-create-accent" />
        <span className="text-xs font-[family-name:var(--font-outfit)] text-create-accent">
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
      <p className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground text-center mb-6">
        Using Rabby? Click MetaMask - works with all browser wallets.
      </p>

      {/* Security note */}
      <div className="pt-6 border-t border-border/50">
        <div className="flex gap-3 text-xs">
          <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
          <p className="font-[family-name:var(--font-outfit)] text-muted-foreground">
            Read-only access. We can only view your address and request signatures. We cannot move your funds.
          </p>
        </div>
      </div>
    </div>
  )
}
