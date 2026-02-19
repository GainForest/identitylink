'use client'

import { getChainName } from '@/lib/chains'
import type { StoredAttestation } from '@/lib/attestation'
import { Check, AlertTriangle } from 'lucide-react'

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
    <div className="glass-panel rounded-xl border border-border/50 overflow-hidden hover:border-create-accent/40 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className={`px-6 py-4 ${allValid ? 'bg-create-accent/10' : 'bg-destructive/5'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            allValid ? 'bg-create-accent/10' : 'bg-destructive/10'
          }`}>
            {allValid ? (
              <Check className="w-6 h-6 text-create-accent" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-destructive" />
            )}
          </div>
          <div>
            <h2 className={`font-[family-name:var(--font-syne)] font-semibold ${allValid ? 'text-create-accent' : 'text-destructive'}`}>
              {allValid ? 'Verified Identity Link' : 'Verification Issues'}
            </h2>
            <p className={`font-[family-name:var(--font-outfit)] text-sm ${allValid ? 'text-create-accent' : 'text-destructive'}`}>
              {attestations.length} linked wallet{attestations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium font-[family-name:var(--font-outfit)]">
            {(handle || did).charAt(0).toUpperCase()}
          </div>
          <div>
            {handle && (
              <p className="font-[family-name:var(--font-outfit)] font-medium text-foreground">@{handle}</p>
            )}
            <p className="font-mono text-sm text-muted-foreground">
              {did.slice(0, 24)}...
            </p>
          </div>
        </div>
      </div>

      {/* Linked Wallets */}
      <div className="px-6 py-4">
        <h3 className="font-[family-name:var(--font-syne)] font-semibold text-sm text-foreground mb-3">Linked Wallets</h3>
        <div className="space-y-3">
          {attestations.map((attestation, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${
                attestation.verified 
                  ? 'border-create-accent/30 bg-create-accent/10' 
                  : 'border-destructive/30 bg-destructive/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {attestation.verified ? (
                      <Check className="w-4 h-4 text-create-accent shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className="font-mono text-sm text-foreground truncate">
                      {attestation.address.slice(0, 6)}...{attestation.address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <span className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground">
                      {getChainName(attestation.chainId)}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-xs font-[family-name:var(--font-outfit)] text-muted-foreground capitalize">
                      {attestation.verifiedSignatureType}
                    </span>
                  </div>
                  {attestation.verificationError && (
                    <p className="font-[family-name:var(--font-outfit)] text-xs text-destructive mt-1 ml-6">
                      {attestation.verificationError}
                    </p>
                  )}
                </div>
                <span className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground shrink-0">
                  {new Date(attestation.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-muted border-t border-border">
        <p className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground text-center">
          Verified at {new Date(verifiedAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
