'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { SOCIAL_PLATFORMS, VERIFIABLE_PLATFORMS, type SocialPlatform } from '@/lib/attestation'

interface SocialLink {
  platform: SocialPlatform
  handle: string
  url?: string
  verified?: boolean
  verifiedAt?: string
  createdAt: string
  rkey: string
}

export default function SocialsPage() {
  const { session, isLoading: authLoading } = useAuth()
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [verifyingKey, setVerifyingKey] = useState<string | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null)

  // Add form state
  const [isAdding, setIsAdding] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('twitter')
  const [handleInput, setHandleInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchSocialLinks = useCallback(async () => {
    if (!session?.did) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/verify/${encodeURIComponent(session.did)}`)
      if (res.ok) {
        const data = await res.json()
        setSocialLinks(data.socialLinks || [])
      }
    } catch (err) {
      console.error('Failed to fetch social links:', err)
    } finally {
      setIsLoading(false)
    }
  }, [session?.did])

  useEffect(() => {
    if (session?.did) {
      fetchSocialLinks()
    }
  }, [session?.did, fetchSocialLinks])

  const handleSave = async () => {
    if (!session?.did || !handleInput.trim()) return

    try {
      setIsSaving(true)
      setSaveError(null)

      const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)
      const computedUrl =
        selectedPlatform === 'website'
          ? handleInput.trim()
          : platformConfig?.urlPrefix
            ? `${platformConfig.urlPrefix}${handleInput.trim()}`
            : undefined

      const res = await fetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          handle: handleInput.trim(),
          url: urlInput.trim() || computedUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      // Reset form and refresh
      setHandleInput('')
      setUrlInput('')
      setIsAdding(false)
      await fetchSocialLinks()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save social link')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (rkey: string) => {
    if (!session?.did) return

    const confirmed = window.confirm('Are you sure you want to remove this social link?')
    if (!confirmed) return

    try {
      setDeletingKey(rkey)
      setError(null)

      const res = await fetch(
        `/api/socials/${encodeURIComponent(session.did)}/${encodeURIComponent(rkey)}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to remove')
      }

      setSocialLinks(prev => prev.filter(s => s.rkey !== rkey))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove social link')
    } finally {
      setDeletingKey(null)
    }
  }

  const handleVerify = async (link: SocialLink) => {
    if (!session?.did) return

    try {
      setVerifyingKey(link.rkey)
      setVerifyError(null)
      setVerifySuccess(null)

      const res = await fetch('/api/socials/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: link.platform,
          handle: link.handle,
          url: link.url,
        }),
      })

      const data = await res.json()

      if (data.verified) {
        setVerifySuccess(link.rkey)
        setTimeout(() => setVerifySuccess(null), 3000)
        // Refresh to get updated verified status
        await fetchSocialLinks()
      } else {
        setVerifyError(data.error || 'Verification failed')
      }
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setVerifyingKey(null)
    }
  }

  // Platforms that haven't been linked yet
  const linkedPlatforms = new Set(socialLinks.map(s => s.platform))
  const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !linkedPlatforms.has(p.id))

  // Reset selected platform when available platforms change
  useEffect(() => {
    if (availablePlatforms.length > 0 && !availablePlatforms.find(p => p.id === selectedPlatform)) {
      setSelectedPlatform(availablePlatforms[0].id)
    }
  }, [availablePlatforms, selectedPlatform])

  if (authLoading) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm text-zinc-500 mt-4">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pt-16 sm:pt-24 pb-16 flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
            Sign In Required
          </h1>
          <p className="text-zinc-500 max-w-sm">
            Sign in with your ATProto account to manage your social links.
          </p>
        </div>
        <Link
          href="/link"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  const currentPlatformConfig = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)

  return (
    <div className="pt-8 sm:pt-12 pb-16 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900">
            Social Profiles
          </h1>
          <p className="text-zinc-500 mt-2">
            Link your social profiles to your DID
          </p>
        </div>

        {/* Identity header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-zinc-300 w-8 shrink-0">ID</span>
            <span className="font-medium text-zinc-800">
              @{session.handle || session.did.slice(0, 20) + '...'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-zinc-300 w-8 shrink-0"></span>
            <span className="font-mono text-xs text-zinc-400 break-all">{session.did}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse p-4 bg-zinc-50 rounded-xl">
                <div className="h-4 bg-zinc-200 rounded w-48 mb-2" />
                <div className="h-3 bg-zinc-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Existing social links */}
            {socialLinks.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-medium text-zinc-700">
                  Linked Profiles ({socialLinks.length})
                </h3>
                {socialLinks.map(link => {
                  const config = SOCIAL_PLATFORMS.find(p => p.id === link.platform)
                  const isVerifiable = VERIFIABLE_PLATFORMS.includes(link.platform)
                  const isVerified = link.verified === true
                  const isVerifying = verifyingKey === link.rkey
                  const justVerified = verifySuccess === link.rkey

                  return (
                    <div
                      key={link.rkey}
                      className={`rounded-xl border ${
                        isVerified
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isVerified ? 'bg-emerald-100' : 'bg-zinc-100'
                          }`}>
                            <PlatformIcon platform={link.platform} className={`w-4 h-4 ${
                              isVerified ? 'text-emerald-700' : 'text-zinc-500'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-zinc-800">
                                {config?.label || link.platform}
                              </p>
                              {isVerified ? (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                                  Unverified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-zinc-500 truncate">{link.handle}</p>
                              {link.url && (
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-0.5 rounded hover:bg-emerald-100 transition-colors shrink-0"
                                  title="Open profile"
                                >
                                  <svg className="w-3 h-3 text-zinc-400 hover:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Verify button */}
                          {isVerifiable && !isVerified && (
                            <button
                              onClick={() => handleVerify(link)}
                              disabled={isVerifying}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100
                                         rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                              title="Verify by checking your bio"
                            >
                              {isVerifying ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              Verify
                            </button>
                          )}
                          {/* Re-verify button for already verified */}
                          {isVerifiable && isVerified && !justVerified && (
                            <button
                              onClick={() => handleVerify(link)}
                              disabled={isVerifying}
                              className="p-1.5 text-zinc-400 hover:text-emerald-600 rounded transition-colors disabled:opacity-50"
                              title="Re-verify"
                            >
                              {isVerifying ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                              )}
                            </button>
                          )}
                          {justVerified && (
                            <span className="text-xs text-emerald-600 font-medium px-2">Verified!</span>
                          )}
                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(link.rkey)}
                            disabled={deletingKey === link.rkey}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 shrink-0"
                            title="Remove"
                          >
                            {deletingKey === link.rkey ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Verification instructions for unverified verifiable links */}
                      {isVerifiable && !isVerified && (
                        <div className="px-4 pb-4 -mt-1">
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800">
                              To verify, add <span className="font-mono font-medium bg-amber-100 px-1 rounded">
                                {session.handle || session.did}
                              </span> to your {config?.label || link.platform} {link.platform === 'website' ? 'page content' : 'bio'}, then click Verify.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Verify error */}
            {verifyError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm text-red-700">{verifyError}</p>
                    <button
                      onClick={() => setVerifyError(null)}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {socialLinks.length === 0 && !isAdding && (
              <div className="text-center py-8 bg-zinc-50 rounded-xl mb-6">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-500 mb-1">No linked social profiles</p>
                <p className="text-xs text-zinc-400 mb-4">Link your social profiles to your decentralized identity.</p>
              </div>
            )}

            {/* Add social form */}
            {isAdding && availablePlatforms.length > 0 && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl mb-6">
                <h3 className="text-sm font-medium text-zinc-700 mb-4">Add Social Profile</h3>

                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{saveError}</p>
                  </div>
                )}

                {/* Platform selector */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Platform</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availablePlatforms.map(platform => (
                      <button
                        key={platform.id}
                        onClick={() => {
                          setSelectedPlatform(platform.id)
                          setHandleInput('')
                          setUrlInput('')
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedPlatform === platform.id
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200'
                        }`}
                      >
                        <PlatformIcon platform={platform.id} className="w-3.5 h-3.5" />
                        {platform.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handle input */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                    {selectedPlatform === 'website' ? 'URL' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder={currentPlatformConfig?.placeholder || 'Enter handle'}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg
                               text-sm text-zinc-800 placeholder-zinc-400
                               focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                  />
                  {currentPlatformConfig?.urlPrefix && handleInput.trim() && (
                    <p className="mt-1 text-xs text-zinc-400">
                      {currentPlatformConfig.urlPrefix}{handleInput.trim()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !handleInput.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg
                               hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setHandleInput('')
                      setUrlInput('')
                      setSaveError(null)
                    }}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add button */}
            {!isAdding && availablePlatforms.length > 0 && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add social profile
              </button>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <Link
            href="/manage"
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            ← Manage wallets
          </Link>
          <Link
            href={`/verify/${session.handle || session.did}`}
            className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            View public profile →
          </Link>
        </div>
      </div>
    </div>
  )
}

function PlatformIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
    case 'telegram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      )
    case 'discord':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'website':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      )
  }
}
