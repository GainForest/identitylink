'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Github } from 'lucide-react'

type TabId = 'overview' | 'how-it-works' | 'api' | 'verification' | 'lexicon'

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'api', label: 'API Reference' },
  { id: 'verification', label: 'Verification' },
  { id: 'lexicon', label: 'Lexicon' },
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  return (
    <div className="pt-8 sm:pt-12 pb-16 animate-fade-in-up">
      <div className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl text-foreground font-bold tracking-tight mb-2">
          Documentation
        </h1>
        <p className="font-[family-name:var(--font-outfit)] text-muted-foreground mb-8">
          Learn how ATProto-EVM Link works and integrate it into your applications.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border/50 mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={
                activeTab === id
                  ? 'px-4 py-2 text-sm font-[family-name:var(--font-outfit)] font-medium text-create-accent border-b-2 border-create-accent -mb-px whitespace-nowrap'
                  : 'px-4 py-2 text-sm font-[family-name:var(--font-outfit)] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap'
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'how-it-works' && <HowItWorksTab />}
          {activeTab === 'api' && <ApiTab />}
          {activeTab === 'verification' && <VerificationTab />}
          {activeTab === 'lexicon' && <LexiconTab />}
        </div>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">What is ATProto-EVM Link?</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            ATProto-EVM Link creates verifiable, cryptographic proofs that connect your ATProto 
            (ATProto) identity to Ethereum wallet addresses. These attestations enable:
          </p>
          <ul className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground space-y-2 mt-3">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-create-accent mt-0.5 shrink-0" />
              <span><strong>Cross-platform identity</strong> - Prove wallet ownership on social platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-create-accent mt-0.5 shrink-0" />
              <span><strong>Payment routing</strong> - Accept crypto payments via your social handle</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-create-accent mt-0.5 shrink-0" />
              <span><strong>Reputation bridging</strong> - Link on-chain activity to social identity</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-create-accent mt-0.5 shrink-0" />
              <span><strong>Decentralized verification</strong> - No central authority needed</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Key Features</h2>
        <div className="grid gap-3">
          <FeatureCard
            title="Self-Sovereign Storage"
            description="Attestations are stored in your own ATProto Personal Data Server (PDS), not a central database. You control your data."
          />
          <FeatureCard
            title="Cryptographic Proofs"
            description="EIP-712 typed signatures that anyone can verify without trusting a third party."
          />
          <FeatureCard
            title="Multi-Chain Support"
            description="Works with Ethereum, Base, Optimism, and Arbitrum. Each attestation is bound to a specific chain."
          />
          <FeatureCard
            title="Smart Wallet Support"
            description="Supports EOAs, Coinbase Smart Wallet, Safe multisigs, and any ERC-1271 compatible wallet."
          />
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Quick Start</h2>
        <ol className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground space-y-2">
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-create-accent/10 text-create-accent text-sm font-medium shrink-0">1</span>
            <span>Sign in with your ATProto account using OAuth</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-create-accent/10 text-create-accent text-sm font-medium shrink-0">2</span>
            <span>Connect your Ethereum wallet (MetaMask, Coinbase, etc.)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-create-accent/10 text-create-accent text-sm font-medium shrink-0">3</span>
            <span>Sign an EIP-712 message to create the attestation</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-create-accent/10 text-create-accent text-sm font-medium shrink-0">4</span>
            <span>Share your verification link for others to verify</span>
          </li>
        </ol>
        <div className="mt-4">
          <Link
            href="/link"
            className="inline-flex items-center gap-2 px-4 py-2 bg-create-accent text-background rounded-lg hover:bg-create-accent/90 transition-colors text-sm font-[family-name:var(--font-outfit)] font-medium"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function HowItWorksTab() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Authentication Flow</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            We use ATProto OAuth 2.0 with DPoP (Demonstrating Proof of Possession) for secure authentication:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
            <pre>{`User          App               ATProto PDS
  │            │                      │
  ├─ Sign In ─►│                      │
  │            ├─ OAuth request ─────►│
  │            │◄─ Auth code ─────────┤
  │            ├─ Exchange tokens ───►│
  │            │◄─ Access + DPoP ─────┤
  │◄─ Done ────┤                      │`}</pre>
          </div>
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            OAuth sessions are bound to the device using DPoP, preventing token theft.
          </p>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">EIP-712 Attestation</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            The attestation uses EIP-712 typed data for human-readable signing:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
            <pre>{`Attestation {
  did: "did:plc:abc123..."      // Your ATProto DID
  evmAddress: "0x1234..."       // Wallet address
  chainId: 8453                 // Chain ID (e.g., Base)
  timestamp: 1706745600         // Unix timestamp
  nonce: 1                      // Replay protection
}`}</pre>
          </div>
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            This message is displayed in your wallet for review before signing.
          </p>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Storage in PDS</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            Attestations are stored as records in your ATProto repository:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
            <pre>{`Collection: org.impactindexer.link.attestation
Record Key: {address}-{chainId}

{
  "$type": "org.impactindexer.link.attestation",
  "address": "0x1234...5678",
  "chainId": 8453,
  "signature": "0xabc...def",
  "message": { ... },
  "signatureType": "eoa",
  "createdAt": "2024-02-01T00:00:00.000Z"
}`}</pre>
          </div>
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            The record key format allows one attestation per address+chain combination.
          </p>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Signature Types</h2>
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg border border-border/50">
            <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground">EOA (Externally Owned Account)</h3>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mt-1">
              Standard ECDSA signature from MetaMask, Rabby, or similar wallets. Verified by recovering the signer from the signature.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg border border-border/50">
            <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground">ERC-1271 (Smart Contract)</h3>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mt-1">
              For smart contract wallets like Coinbase Smart Wallet or Safe. Verified by calling <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">isValidSignature()</code> on the contract.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg border border-border/50">
            <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground">ERC-6492 (Counterfactual)</h3>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mt-1">
              For smart wallets that haven&apos;t been deployed yet. Includes deployment data in the signature.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ApiTab() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Authentication</h2>
        
        <ApiEndpoint
          method="POST"
          path="/api/login"
          description="Initiate ATProto OAuth flow"
          request={`{
  "handle": "alice.bsky.social",
  "returnTo": "/link"  // Optional redirect after auth
}`}
          response={`{
  "redirectUrl": "https://bsky.social/oauth/authorize?..."
}`}
        />

        <ApiEndpoint
          method="GET"
          path="/api/status"
          description="Check authentication status"
          response={`{
  "authenticated": true,
  "did": "did:plc:abc123",
  "handle": "alice.bsky.social",
  "displayName": "Alice",
  "avatar": "https://..."
}`}
        />

        <ApiEndpoint
          method="POST"
          path="/api/logout"
          description="Clear session and sign out"
          response={`{ "success": true }`}
        />
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Attestations</h2>

        <ApiEndpoint
          method="POST"
          path="/api/attestations"
          description="Create a new attestation (requires authentication)"
          request={`{
  "address": "0x1234...5678",
  "chainId": 8453,
  "signature": "0xabc...def",
  "message": {
    "did": "did:plc:abc123",
    "evmAddress": "0x1234...5678",
    "chainId": "8453",
    "timestamp": "1706745600",
    "nonce": "1"
  },
  "signatureType": "eoa"
}`}
          response={`{
  "success": true,
  "uri": "at://did:plc:abc123/org.impactindexer.link.attestation/0x1234-8453",
  "cid": "bafyrei..."
}`}
        />

        <ApiEndpoint
          method="GET"
          path="/api/attestations/{did}"
          description="Fetch all attestations for a DID or handle"
          response={`{
  "did": "did:plc:abc123",
  "attestations": [
    {
      "address": "0x1234...5678",
      "chainId": 8453,
      "signature": "0x...",
      "signatureType": "eoa",
      "createdAt": "2024-02-01T00:00:00.000Z",
      "rkey": "0x1234-8453"
    }
  ],
  "count": 1
}`}
        />

        <ApiEndpoint
          method="DELETE"
          path="/api/attestations/{did}/{rkey}"
          description="Delete an attestation (requires authentication, owner only)"
          response={`{ "success": true }`}
        />
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Verification</h2>

        <ApiEndpoint
          method="GET"
          path="/api/verify/{identifier}"
          description="Verify all attestations for a handle or DID"
          response={`{
  "did": "did:plc:abc123",
  "handle": "alice.bsky.social",
  "attestations": [
    {
      "address": "0x1234...5678",
      "chainId": 8453,
      "valid": true,
      "signerType": "eoa",
      "createdAt": "2024-02-01T00:00:00.000Z"
    }
  ],
  "verifiedAt": "2024-02-01T12:00:00.000Z"
}`}
        />
      </section>
    </div>
  )
}

function VerificationTab() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">How Verification Works</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            Anyone can verify an attestation without authentication. The verification process:
          </p>
          <ol className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground space-y-2">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-medium shrink-0 border border-border/50">1</span>
              <span><strong>Fetch</strong> - Retrieve the attestation record from the user&apos;s PDS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-medium shrink-0 border border-border/50">2</span>
              <span><strong>Reconstruct</strong> - Rebuild the EIP-712 typed data from the stored message</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-medium shrink-0 border border-border/50">3</span>
              <span><strong>Verify</strong> - Check the signature against the claimed address</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-medium shrink-0 border border-border/50">4</span>
              <span><strong>Confirm</strong> - Ensure the DID in the message matches the repo owner</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Verification Methods</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground mb-2">Via Web UI</h3>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mb-2">
              Visit the verification page with a handle or DID:
            </p>
            <code className="block bg-muted rounded-lg p-3 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
              https://link.piss.beauty/verify/alice.bsky.social
            </code>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground mb-2">Via API</h3>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mb-2">
              Call the verification endpoint programmatically:
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
              <pre>{`curl https://link.piss.beauty/api/verify/alice.bsky.social`}</pre>
            </div>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground mb-2">Direct PDS Query</h3>
            <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mb-2">
              Query the user&apos;s PDS directly using ATProto APIs:
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
              <pre>{`GET https://bsky.social/xrpc/com.atproto.repo.listRecords
  ?repo=did:plc:abc123
  &collection=org.impactindexer.link.attestation`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Code Example</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            Verify an attestation in TypeScript:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
            <pre>{`import { recoverAddress, hashTypedData } from 'viem'

async function verifyAttestation(attestation) {
  const domain = {
    name: 'ATProto EVM Attestation',
    version: '1',
  }
  
  const types = {
    Attestation: [
      { name: 'did', type: 'string' },
      { name: 'evmAddress', type: 'address' },
      { name: 'chainId', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  }
  
  const message = {
    did: attestation.message.did,
    evmAddress: attestation.message.evmAddress,
    chainId: BigInt(attestation.message.chainId),
    timestamp: BigInt(attestation.message.timestamp),
    nonce: BigInt(attestation.message.nonce),
  }
  
  const hash = hashTypedData({ domain, types, primaryType: 'Attestation', message })
  const recovered = await recoverAddress({ hash, signature: attestation.signature })
  
  return recovered.toLowerCase() === attestation.address.toLowerCase()
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  )
}

function LexiconTab() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Lexicon Schema</h2>
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground leading-relaxed">
            Attestations use the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">org.impactindexer.link.attestation</code> lexicon.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/GainForest/lexicons/blob/main/lexicons/org/impactindexer/link/attestation.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-create-accent hover:text-create-accent/80 underline underline-offset-2"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Schema Definition</h2>
        <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50">
          <pre>{`{
  "lexicon": 1,
  "id": "org.impactindexer.link.attestation",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["address", "chainId", "signature", "message", "signatureType", "createdAt"],
        "properties": {
          "address": {
            "type": "string",
            "minLength": 42,
            "maxLength": 42,
            "description": "EVM wallet address (0x-prefixed)"
          },
          "chainId": {
            "type": "integer",
            "minimum": 1,
            "description": "EVM chain ID"
          },
          "signature": {
            "type": "string",
            "minLength": 132,
            "maxLength": 1000,
            "description": "EIP-712 signature (hex)"
          },
          "message": {
            "type": "ref",
            "ref": "#eip712Message"
          },
          "signatureType": {
            "type": "string",
            "knownValues": ["eoa", "erc1271", "erc6492"]
          },
          "createdAt": {
            "type": "string",
            "format": "datetime"
          }
        }
      }
    },
    "eip712Message": {
      "type": "object",
      "required": ["did", "evmAddress", "chainId", "timestamp", "nonce"],
      "properties": {
        "did": { "type": "string", "maxLength": 2048 },
        "evmAddress": { "type": "string", "minLength": 42, "maxLength": 42 },
        "chainId": { "type": "string", "maxLength": 78 },
        "timestamp": { "type": "string", "maxLength": 78 },
        "nonce": { "type": "string", "maxLength": 78 }
      }
    }
  }
}`}</pre>
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-border/50 p-6 mb-6">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-foreground mb-3">Related Resources</h2>
        <ul className="text-sm font-[family-name:var(--font-outfit)] text-muted-foreground space-y-2">
          <li>
            <a
              href="https://atproto.com/specs/lexicon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-create-accent hover:text-create-accent/80 underline underline-offset-2"
            >
              ATProto Lexicon Specification
            </a>
          </li>
          <li>
            <a
              href="https://eips.ethereum.org/EIPS/eip-712"
              target="_blank"
              rel="noopener noreferrer"
              className="text-create-accent hover:text-create-accent/80 underline underline-offset-2"
            >
              EIP-712: Typed Structured Data Hashing and Signing
            </a>
          </li>
          <li>
            <a
              href="https://eips.ethereum.org/EIPS/eip-1271"
              target="_blank"
              rel="noopener noreferrer"
              className="text-create-accent hover:text-create-accent/80 underline underline-offset-2"
            >
              EIP-1271: Standard Signature Validation Method for Contracts
            </a>
          </li>
          <li>
            <a
              href="https://github.com/GainForest/lexicons"
              target="_blank"
              rel="noopener noreferrer"
              className="text-create-accent hover:text-create-accent/80 underline underline-offset-2"
            >
              GainForest Lexicons Repository
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 bg-muted rounded-lg border border-border/50">
      <h3 className="font-[family-name:var(--font-syne)] font-medium text-foreground">{title}</h3>
      <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

function ApiEndpoint({
  method,
  path,
  description,
  request,
  response,
}: {
  method: string
  path: string
  description: string
  request?: string
  response: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-create-accent/10 text-create-accent',
    POST: 'bg-create-accent/10 text-create-accent',
    DELETE: 'bg-create-accent/10 text-create-accent',
  }

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className={`bg-create-accent/10 text-create-accent text-xs font-[family-name:var(--font-outfit)] font-medium px-2 py-0.5 rounded-full ${methodColors[method]}`}>
          {method}
        </span>
        <code className="font-mono text-sm text-foreground">{path}</code>
      </div>
      <p className="font-[family-name:var(--font-outfit)] text-sm text-muted-foreground mb-3">{description}</p>
      {request && (
        <div className="mb-2">
          <span className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground uppercase tracking-wide">Request</span>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50 mt-1">
            <pre>{request}</pre>
          </div>
        </div>
      )}
      <div>
        <span className="font-[family-name:var(--font-outfit)] text-xs text-muted-foreground uppercase tracking-wide">Response</span>
        <div className="bg-muted rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto border border-border/50 mt-1">
          <pre>{response}</pre>
        </div>
      </div>
    </div>
  )
}
