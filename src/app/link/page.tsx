'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useAuth } from '@/lib/auth'
import { AtprotoAuthStep } from '@/components/steps/AtprotoAuthStep'
import { WalletConnectStep } from '@/components/steps/WalletConnectStep'
import { ReviewStep } from '@/components/steps/ReviewStep'
import { SuccessStep } from '@/components/steps/SuccessStep'

type Step = 'atproto' | 'wallet' | 'review' | 'success'

export default function LinkPage() {
  const [attestationUri, setAttestationUri] = useState<string | null>(null)
  const [manualStep, setManualStep] = useState<Step | null>(null)
  
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isConnected } = useAccount()

  // Determine current step based on state
  const currentStep: Step = (() => {
    if (attestationUri) return 'success'
    if (manualStep) return manualStep
    if (isAuthenticated && isConnected) return 'review'
    if (isAuthenticated) return 'wallet'
    return 'atproto'
  })()

  // Loading state
  if (authLoading) {
    return (
      <div className="pt-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-8 sm:pt-12 pb-16">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['atproto', 'wallet', 'review', 'success'] as const).map((step, i) => (
          <div key={step} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : getStepIndex(currentStep) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-100 text-zinc-400'
                }
              `}
            >
              {getStepIndex(currentStep) > i ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div 
                className={`w-8 h-0.5 mx-1 ${
                  getStepIndex(currentStep) > i ? 'bg-green-500' : 'bg-zinc-200'
                }`} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs text-zinc-400 mb-8 px-2">
        <span className={currentStep === 'atproto' ? 'text-blue-600 font-medium' : ''}>Sign In</span>
        <span className={currentStep === 'wallet' ? 'text-blue-600 font-medium' : ''}>Connect</span>
        <span className={currentStep === 'review' ? 'text-blue-600 font-medium' : ''}>Review</span>
        <span className={currentStep === 'success' ? 'text-blue-600 font-medium' : ''}>Done</span>
      </div>

      {/* Step content */}
      {currentStep === 'atproto' && (
        <AtprotoAuthStep />
      )}
      
      {currentStep === 'wallet' && (
        <WalletConnectStep 
          onContinue={() => setManualStep('review')} 
        />
      )}
      
      {currentStep === 'review' && (
        <ReviewStep
          onSuccess={(uri) => setAttestationUri(uri)}
          onBack={() => setManualStep('wallet')}
        />
      )}
      
      {currentStep === 'success' && attestationUri && (
        <SuccessStep attestationUri={attestationUri} />
      )}
    </div>
  )
}

function getStepIndex(step: Step): number {
  const steps: Step[] = ['atproto', 'wallet', 'review', 'success']
  return steps.indexOf(step)
}
