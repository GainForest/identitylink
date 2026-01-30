import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="pt-12 sm:pt-20 pb-16">
      {/* Hero */}
      <div className="max-w-lg">
        <h2 className="font-[family-name:var(--font-garamond)] text-3xl sm:text-4xl text-zinc-900 leading-tight">
          Link Your Identities
        </h2>
        <p className="text-zinc-500 mt-3 leading-relaxed">
          Create a verifiable connection between your Bluesky identity and Ethereum wallet. 
          Accept payments, build reputation, and prove you&apos;re really you.
        </p>
      </div>

      {/* Main CTA */}
      <div className="mt-8">
        <Link
          href="/link"
          className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-medium 
                     rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Link Your Identity
        </Link>
      </div>

      {/* Features */}
      <div className="mt-12 space-y-4">
        <FeatureRow
          icon="💸"
          title="Receive Payments"
          description="Share your Bluesky handle and receive crypto to your linked wallet"
        />
        <FeatureRow
          icon="🔒"
          title="Cryptographic Proof"
          description="Create unforgeable proof that you control both identities"
        />
        <FeatureRow
          icon="🦋"
          title="Works with Bluesky"
          description="Sign in with your existing ATProto identity"
        />
        <FeatureRow
          icon="👛"
          title="Any Wallet"
          description="Supports MetaMask, Coinbase, Safe, and more"
        />
      </div>

      {/* Supported chains */}
      <div className="mt-12 pt-8 border-t border-zinc-100">
        <h3 className="text-sm font-medium text-zinc-700 mb-4">Supported Networks</h3>
        <div className="flex flex-wrap gap-3">
          <ChainBadge name="Ethereum" color="#627EEA" />
          <ChainBadge name="Base" color="#0052FF" />
          <ChainBadge name="Optimism" color="#FF0420" />
          <ChainBadge name="Arbitrum" color="#12AAFF" />
        </div>
      </div>

      {/* How it works */}
      <div className="mt-12 pt-8 border-t border-zinc-100">
        <h3 className="text-sm font-medium text-zinc-700 mb-4">How it works</h3>
        <div className="space-y-4">
          <StepRow number={1} title="Sign in with Bluesky" description="Authenticate with your ATProto identity" />
          <StepRow number={2} title="Connect wallet" description="Link any Ethereum wallet you control" />
          <StepRow number={3} title="Sign message" description="Create a cryptographic attestation" />
          <StepRow number={4} title="Share & verify" description="Anyone can verify your linked identities" />
        </div>
      </div>

      {/* Verify existing */}
      <div className="mt-12 pt-8 border-t border-zinc-100">
        <p className="text-sm text-zinc-500">
          Want to verify someone&apos;s link?{' '}
          <Link href="/verify/example.bsky.social" className="text-blue-600 hover:underline">
            Try the verification page
          </Link>
        </p>
      </div>
    </div>
  )
}

function FeatureRow({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 -mx-4 rounded-lg hover:bg-zinc-50 transition-colors">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-medium text-zinc-800">{title}</h3>
        <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function ChainBadge({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-full">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm text-zinc-600">{name}</span>
    </div>
  )
}

function StepRow({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center justify-center shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-zinc-800">{title}</h4>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  )
}
