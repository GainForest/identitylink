'use client'

interface SigningAnimationProps {
  walletType: 'eoa' | 'smart-wallet' | 'unknown'
  message?: string
}

export function SigningAnimation({ walletType, message }: SigningAnimationProps) {
  const isPasskey = walletType === 'smart-wallet'

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Animated icon */}
      <div className="relative mb-6">
        {isPasskey ? (
          // Biometric icon for passkey wallets
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
            </svg>
          </div>
        ) : (
          // Wallet icon for standard wallets
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
        )}
        
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" />
      </div>

      {/* Status text */}
      <h3 className="text-lg font-medium text-zinc-800 mb-2">
        {isPasskey ? 'Waiting for Biometric' : 'Waiting for Signature'}
      </h3>
      
      <p className="text-sm text-zinc-500 max-w-xs">
        {message || (isPasskey 
          ? 'Confirm with Face ID or fingerprint on your device'
          : 'Please approve the signature request in your wallet'
        )}
      </p>

      {/* Hint */}
      <p className="text-xs text-zinc-400 mt-4">
        {isPasskey 
          ? 'Your biometric data never leaves your device'
          : 'This is a signature, not a transaction'
        }
      </p>
    </div>
  )
}
