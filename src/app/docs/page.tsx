'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <div className="pt-8 sm:pt-12 pb-16">
      <div className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl sm:text-3xl text-zinc-900 mb-2">
          Documentation
        </h1>
        <p className="text-zinc-500 mb-8">
          Learn how ATProto-EVM Link works and integrate it into your applications.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                activeTab === id
                  ? 'bg-emerald-100 text-emerald-800 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="prose prose-zinc prose-sm max-w-none">
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
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">What is ATProto-EVM Link?</h2>
        <p className="text-zinc-600 leading-relaxed">
          ATProto-EVM Link creates verifiable, cryptographic proofs that connect your Bluesky 
          (ATProto) identity to Ethereum wallet addresses. These attestations enable:
        </p>
        <ul className="mt-3 space-y-2 text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            <span><strong>Cross-platform identity</strong> - Prove wallet ownership on social platforms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            <span><strong>Payment routing</strong> - Accept crypto payments via your social handle</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            <span><strong>Reputation bridging</strong> - Link on-chain activity to social identity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            <span><strong>Decentralized verification</strong> - No central authority needed</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Key Features</h2>
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

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Quick Start</h2>
        <ol className="space-y-3 text-zinc-600">
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium shrink-0">1</span>
            <span>Sign in with your Bluesky account using OAuth</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium shrink-0">2</span>
            <span>Connect your Ethereum wallet (MetaMask, Coinbase, etc.)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium shrink-0">3</span>
            <span>Sign an EIP-712 message to create the attestation</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium shrink-0">4</span>
            <span>Share your verification link for others to verify</span>
          </li>
        </ol>
        <div className="mt-4">
          <Link
            href="/link"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

function HowItWorksTab() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Authentication Flow</h2>
        <p className="text-zinc-600 mb-4">
          We use ATProto OAuth 2.0 with DPoP (Demonstrating Proof of Possession) for secure authentication:
        </p>
        <div className="bg-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-zinc-600">{`User          App               Bluesky PDS
  │            │                      │
  ├─ Sign In ─►│                      │
  │            ├─ OAuth request ─────►│
  │            │◄─ Auth code ─────────┤
  │            ├─ Exchange tokens ───►│
  │            │◄─ Access + DPoP ─────┤
  │◄─ Done ────┤                      │`}</pre>
        </div>
        <p className="text-zinc-500 text-sm mt-3">
          OAuth sessions are bound to the device using DPoP, preventing token theft.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">EIP-712 Attestation</h2>
        <p className="text-zinc-600 mb-4">
          The attestation uses EIP-712 typed data for human-readable signing:
        </p>
        <div className="bg-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-zinc-600">{`Attestation {
  did: "did:plc:abc123..."      // Your ATProto DID
  evmAddress: "0x1234..."       // Wallet address
  chainId: 8453                 // Chain ID (e.g., Base)
  timestamp: 1706745600         // Unix timestamp
  nonce: 1                      // Replay protection
}`}</pre>
        </div>
        <p className="text-zinc-500 text-sm mt-3">
          This message is displayed in your wallet for review before signing.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Storage in PDS</h2>
        <p className="text-zinc-600 mb-4">
          Attestations are stored as records in your ATProto repository:
        </p>
        <div className="bg-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-zinc-600">{`Collection: org.impactindexer.link.attestation
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
        <p className="text-zinc-500 text-sm mt-3">
          The record key format allows one attestation per address+chain combination.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Signature Types</h2>
        <div className="space-y-3">
          <div className="p-3 bg-zinc-50 rounded-lg">
            <h3 className="font-medium text-zinc-800">EOA (Externally Owned Account)</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Standard ECDSA signature from MetaMask, Rabby, or similar wallets. Verified by recovering the signer from the signature.
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg">
            <h3 className="font-medium text-zinc-800">ERC-1271 (Smart Contract)</h3>
            <p className="text-sm text-zinc-500 mt-1">
              For smart contract wallets like Coinbase Smart Wallet or Safe. Verified by calling <code className="bg-zinc-200 px-1 rounded">isValidSignature()</code> on the contract.
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg">
            <h3 className="font-medium text-zinc-800">ERC-6492 (Counterfactual)</h3>
            <p className="text-sm text-zinc-500 mt-1">
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
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Authentication</h2>
        
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

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Attestations</h2>

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

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Verification</h2>

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
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">How Verification Works</h2>
        <p className="text-zinc-600 mb-4">
          Anyone can verify an attestation without authentication. The verification process:
        </p>
        <ol className="space-y-3 text-zinc-600">
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium shrink-0">1</span>
            <span><strong>Fetch</strong> - Retrieve the attestation record from the user&apos;s PDS</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium shrink-0">2</span>
            <span><strong>Reconstruct</strong> - Rebuild the EIP-712 typed data from the stored message</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium shrink-0">3</span>
            <span><strong>Verify</strong> - Check the signature against the claimed address</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-700 text-sm font-medium shrink-0">4</span>
            <span><strong>Confirm</strong> - Ensure the DID in the message matches the repo owner</span>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Verification Methods</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-zinc-800 mb-2">Via Web UI</h3>
            <p className="text-zinc-600 text-sm mb-2">
              Visit the verification page with a handle or DID:
            </p>
            <code className="block bg-zinc-50 p-3 rounded-lg text-sm text-zinc-700">
              https://link.piss.beauty/verify/alice.bsky.social
            </code>
          </div>

          <div>
            <h3 className="font-medium text-zinc-800 mb-2">Via API</h3>
            <p className="text-zinc-600 text-sm mb-2">
              Call the verification endpoint programmatically:
            </p>
            <div className="bg-zinc-50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-zinc-600">{`curl https://link.piss.beauty/api/verify/alice.bsky.social`}</pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-zinc-800 mb-2">Direct PDS Query</h3>
            <p className="text-zinc-600 text-sm mb-2">
              Query the user&apos;s PDS directly using ATProto APIs:
            </p>
            <div className="bg-zinc-50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-zinc-600">{`GET https://bsky.social/xrpc/com.atproto.repo.listRecords
  ?repo=did:plc:abc123
  &collection=org.impactindexer.link.attestation`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Code Example</h2>
        <p className="text-zinc-600 mb-4">
          Verify an attestation in TypeScript:
        </p>
        <div className="bg-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-zinc-600">{`import { recoverAddress, hashTypedData } from 'viem'

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
      </section>
    </div>
  )
}

function LexiconTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Lexicon Schema</h2>
        <p className="text-zinc-600 mb-4">
          Attestations use the <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">org.impactindexer.link.attestation</code> lexicon.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <a
            href="https://github.com/GainForest/lexicons/blob/main/lexicons/org/impactindexer/link/attestation.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Schema Definition</h2>
        <div className="bg-zinc-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-zinc-600">{`{
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

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">Related Resources</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://atproto.com/specs/lexicon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              ATProto Lexicon Specification
            </a>
          </li>
          <li>
            <a
              href="https://eips.ethereum.org/EIPS/eip-712"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              EIP-712: Typed Structured Data Hashing and Signing
            </a>
          </li>
          <li>
            <a
              href="https://eips.ethereum.org/EIPS/eip-1271"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              EIP-1271: Standard Signature Validation Method for Contracts
            </a>
          </li>
          <li>
            <a
              href="https://github.com/GainForest/lexicons"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
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
    <div className="p-4 bg-zinc-50 rounded-lg">
      <h3 className="font-medium text-zinc-800">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1">{description}</p>
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
    GET: 'bg-emerald-100 text-emerald-700',
    POST: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
  }

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm text-zinc-700">{path}</code>
      </div>
      <p className="text-sm text-zinc-500 mb-3">{description}</p>
      {request && (
        <div className="mb-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wide">Request</span>
          <div className="bg-zinc-50 rounded-lg p-3 font-mono text-xs mt-1 overflow-x-auto">
            <pre className="text-zinc-600">{request}</pre>
          </div>
        </div>
      )}
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wide">Response</span>
        <div className="bg-zinc-50 rounded-lg p-3 font-mono text-xs mt-1 overflow-x-auto">
          <pre className="text-zinc-600">{response}</pre>
        </div>
      </div>
    </div>
  )
}
