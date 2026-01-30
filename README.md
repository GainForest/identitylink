# ATProto-EVM Identity Link

> Bridge your decentralized social identity (ATProto/Bluesky) with your Ethereum wallet address through cryptographically verifiable attestations.

[![Lexicon](https://img.shields.io/badge/lexicon-org.impactindexer.link-blue)](https://github.com/GainForest/lexicons)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)

## Overview

ATProto-EVM Link allows users to create verifiable, cryptographic proofs linking their Bluesky (ATProto) identity to Ethereum wallet addresses. These attestations are:

- **Self-sovereign** - Stored in the user's own ATProto Personal Data Server (PDS)
- **Cryptographically verifiable** - Anyone can verify the EIP-712 signature
- **Multi-chain** - Works with Ethereum, Base, Optimism, and Arbitrum
- **Wallet-agnostic** - Supports EOAs, smart wallets (Coinbase), and multisigs (Safe)

## Features

| Feature | Description |
|---------|-------------|
| **ATProto OAuth** | Secure authentication via Bluesky using OAuth 2.0 + DPoP |
| **EIP-712 Signatures** | Human-readable, typed data signing for wallet attestations |
| **Multi-chain Support** | Ethereum Mainnet, Base, Optimism, Arbitrum |
| **Smart Wallet Support** | EOA, Coinbase Smart Wallet (ERC-4337), Safe multisigs (ERC-1271) |
| **Decentralized Storage** | Attestations stored in user's ATProto PDS, not a central database |
| **Public Verification** | Anyone can verify attestations without authentication |
| **Unlink Capability** | Users can revoke attestations at any time |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/piss-beauty/atproto-evm-link.git
cd atproto-evm-link

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

Visit `http://127.0.0.1:3333` to use the app.

> **Note:** The dev server binds to `127.0.0.1` (not `localhost`) as required by ATProto OAuth per RFC 8252.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COOKIE_SECRET` | Yes | 32+ character secret for session encryption |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | WalletConnect Cloud project ID |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | No | Alchemy API key for better RPC |
| `PUBLIC_URL` | Prod | Production URL (e.g., `https://link.piss.beauty`) |
| `ATPROTO_JWK_PRIVATE` | Prod | Private JWK for confidential OAuth client |

Generate a JWK for production:
```bash
node scripts/generate-jwk.js
```

## How It Works

### 1. Authentication Flow

```
User                    App                     Bluesky PDS
  │                      │                           │
  ├─ Click "Sign In" ───►│                           │
  │                      ├─ OAuth authorize ────────►│
  │                      │◄─ Authorization code ─────┤
  │                      ├─ Exchange for tokens ────►│
  │                      │◄─ Access + DPoP tokens ───┤
  │◄─ Session created ───┤                           │
```

### 2. Attestation Creation

```
User                    App                     Wallet
  │                      │                        │
  ├─ Connect wallet ────►│                        │
  │                      ├─ Request signature ───►│
  │                      │     (EIP-712 typed)    │
  │                      │◄─ Signed message ──────┤
  │◄─ Show confirmation ─┤                        │
```

### 3. Storage in PDS

The signed attestation is stored as an ATProto record:

```json
{
  "$type": "org.impactindexer.link.attestation",
  "address": "0x1234...5678",
  "chainId": 1,
  "signature": "0xabc...def",
  "message": {
    "did": "did:plc:abc123",
    "evmAddress": "0x1234...5678",
    "chainId": "1",
    "timestamp": "1706745600",
    "nonce": "1"
  },
  "signatureType": "eoa",
  "createdAt": "2024-02-01T00:00:00.000Z"
}
```

### 4. Verification

Anyone can verify an attestation by:

1. Fetching the attestation from the user's PDS
2. Reconstructing the EIP-712 message
3. Recovering the signer address from the signature
4. Comparing with the claimed address

For smart contract wallets (ERC-1271), the contract's `isValidSignature` method is called.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── attestations/        # CRUD for attestations
│   │   │   ├── route.ts         # POST: Create attestation
│   │   │   ├── [did]/
│   │   │   │   ├── route.ts     # GET: List attestations for DID
│   │   │   │   └── [rkey]/
│   │   │   │       └── route.ts # DELETE: Remove attestation
│   │   ├── login/route.ts       # POST: Initiate OAuth
│   │   ├── logout/route.ts      # POST: Clear session
│   │   ├── oauth/
│   │   │   ├── callback/        # OAuth redirect handler
│   │   │   ├── client-metadata.json/  # OAuth client config
│   │   │   └── jwks.json/       # Public keys for confidential client
│   │   ├── status/route.ts      # GET: Check auth status
│   │   └── verify/[identifier]/ # GET: Verify attestations
│   ├── docs/page.tsx            # Documentation page
│   ├── link/page.tsx            # Linking wizard
│   ├── manage/page.tsx          # Manage linked wallets
│   └── verify/[identifier]/     # Public verification page
├── components/
│   ├── steps/                   # Wizard step components
│   │   ├── AtprotoAuthStep.tsx
│   │   ├── WalletConnectStep.tsx
│   │   ├── ReviewStep.tsx
│   │   └── SuccessStep.tsx
│   └── ...                      # Shared UI components
├── hooks/
│   ├── useAttestationSigning.ts # EIP-712 signing hook
│   └── useWalletType.ts         # Detect EOA vs smart wallet
├── lib/
│   ├── auth/client.ts           # ATProto OAuth client
│   ├── attestation.ts           # EIP-712 types & helpers
│   ├── pds.ts                   # PDS storage operations
│   ├── verify.ts                # Signature verification
│   └── wagmi.ts                 # Wallet configuration
└── providers/
    └── WagmiProvider.tsx        # Wallet provider wrapper
```

## API Reference

### `POST /api/login`

Initiate ATProto OAuth flow.

**Request:**
```json
{
  "handle": "alice.bsky.social",
  "returnTo": "/link"
}
```

**Response:**
```json
{
  "redirectUrl": "https://bsky.social/oauth/authorize?..."
}
```

### `GET /api/status`

Check authentication status.

**Response:**
```json
{
  "authenticated": true,
  "did": "did:plc:abc123",
  "handle": "alice.bsky.social"
}
```

### `POST /api/attestations`

Create a new attestation.

**Request:**
```json
{
  "address": "0x1234...5678",
  "chainId": 1,
  "signature": "0xabc...def",
  "message": { ... },
  "signatureType": "eoa"
}
```

### `GET /api/attestations/[did]`

Fetch all attestations for a DID or handle.

**Response:**
```json
{
  "did": "did:plc:abc123",
  "attestations": [...],
  "count": 2
}
```

### `DELETE /api/attestations/[did]/[rkey]`

Delete an attestation (authenticated, owner only).

### `GET /api/verify/[identifier]`

Verify all attestations for a handle or DID.

**Response:**
```json
{
  "did": "did:plc:abc123",
  "handle": "alice.bsky.social",
  "attestations": [
    {
      "address": "0x1234...5678",
      "chainId": 1,
      "valid": true,
      "signerType": "eoa"
    }
  ]
}
```

## Lexicon

Attestations use the `org.impactindexer.link.attestation` lexicon:

- **Repository:** [GainForest/lexicons](https://github.com/GainForest/lexicons)
- **Path:** `lexicons/org/impactindexer/link/attestation.json`

## Supported Wallets

| Wallet | Type | Signature Standard |
|--------|------|-------------------|
| MetaMask | EOA | ECDSA (secp256k1) |
| Rabby | EOA | ECDSA (secp256k1) |
| Coinbase Wallet | EOA | ECDSA (secp256k1) |
| Coinbase Smart Wallet | Smart Contract | ERC-1271 |
| Safe | Multisig | ERC-1271 |
| WalletConnect | Various | Depends on connected wallet |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Ethereum:** wagmi v2 + viem
- **ATProto:** @atproto/api + @atproto/oauth-client-node
- **Sessions:** iron-session

## Security Considerations

1. **Session Storage:** OAuth sessions are stored in-memory only (not cookies) due to size constraints. For production, use Redis or a database.

2. **Signature Replay:** Each attestation includes a timestamp and nonce to prevent replay attacks.

3. **Chain ID Binding:** Attestations are bound to a specific chain ID to prevent cross-chain confusion.

4. **DID Verification:** The signed message includes the user's DID, ensuring the attestation is bound to their identity.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT

## Related Projects

- [GainForest Lexicons](https://github.com/GainForest/lexicons) - ATProto lexicon definitions
- [Hypergoat](https://hypergoat.vercel.app) - ATProto AppView for indexing
- [Impact Indexer](https://impactindexer.org) - Environmental impact data explorer
