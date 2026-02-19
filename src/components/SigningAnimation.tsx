'use client'

import { Fingerprint, Wallet } from 'lucide-react'

interface SigningAnimationProps {
  walletType: 'eoa' | 'smart-wallet' | 'unknown'
  message?: string
}

export function SigningAnimation({ walletType, message }: SigningAnimationProps) {
  const isPasskey = walletType === 'smart-wallet'

  return (
    <div className="glass-panel rounded-2xl p-8 border border-border/50 text-center animate-fade-in flex flex-col items-center justify-center">
      {/* Animated icon */}
      <div className="relative mb-6">
        {/* Spinning ring */}
        <div className="w-16 h-16 rounded-full border-4 border-create-accent/20 border-t-create-accent animate-spin" />
        {/* Icon centered inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isPasskey ? (
            <Fingerprint className="w-7 h-7 text-create-accent" />
          ) : (
            <Wallet className="w-7 h-7 text-create-accent" />
          )}
        </div>
      </div>

      {/* Status text */}
      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-2">
        {isPasskey ? 'Waiting for Biometric' : 'Waiting for Signature'}
      </h3>
      
      <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground max-w-xs">
        {message || (isPasskey 
          ? 'Confirm with Face ID or fingerprint on your device'
          : 'Please approve the signature request in your wallet'
        )}
      </p>

      {/* Hint */}
      <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground mt-4">
        {isPasskey 
          ? 'Your biometric data never leaves your device'
          : 'This is a signature, not a transaction'
        }
      </p>
    </div>
  )
}
