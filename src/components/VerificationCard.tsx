'use client'

import { getChainName } from '@/lib/chains'
import type { StoredAttestation } from '@/lib/attestation'

interface VerifiedAttestation extends StoredAttestation {
  verified: boolean
  verifiedSignatureType: string
  verificationError?: string
}

interface VerificationCardProps {
  did: string
  handle?: string
  attestations: VerifiedAttestation[]
  verifiedAt: string
}

export function VerificationCard({
  did,
  handle,
  attestations,
  verifiedAt,
}: VerificationCardProps) {
  const allValid = attestations.every(a => a.verified)

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${allValid ? 'bg-green-50' : 'bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            allValid ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {allValid ? (
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className={`font-medium ${allValid ? 'text-green-800' : 'text-amber-800'}`}>
              {allValid ? 'Verified Identity Link' : 'Verification Issues'}
            </h2>
            <p className={`text-sm ${allValid ? 'text-green-600' : 'text-amber-600'}`}>
              {attestations.length} linked wallet{attestations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="px-6 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {(handle || did).charAt(0).toUpperCase()}
          </div>
          <div>
            {handle && (
              <p className="font-medium text-zinc-900">@{handle}</p>
            )}
            <p className="text-sm text-zinc-500 font-mono">
              {did.slice(0, 24)}...
            </p>
          </div>
        </div>
      </div>

      {/* Linked Wallets */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">Linked Wallets</h3>
        <div className="space-y-3">
          {attestations.map((attestation, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${
                attestation.verified 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-red-200 bg-red-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {attestation.verified ? (
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="text-sm font-mono text-zinc-700 truncate">
                      {attestation.address.slice(0, 6)}...{attestation.address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <span className="text-xs text-zinc-500">
                      {getChainName(attestation.chainId)}
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-xs text-zinc-500 capitalize">
                      {attestation.verifiedSignatureType}
                    </span>
                  </div>
                  {attestation.verificationError && (
                    <p className="text-xs text-red-600 mt-1 ml-6">
                      {attestation.verificationError}
                    </p>
                  )}
                </div>
                <span className="text-xs text-zinc-400 shrink-0">
                  {new Date(attestation.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100">
        <p className="text-xs text-zinc-400 text-center">
          Verified at {new Date(verifiedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
