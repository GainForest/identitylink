# Contributing to ATProto-EVM Link

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Adding New Features](#adding-new-features)

## Development Setup

### Prerequisites

- Node.js 18 or later
- npm (comes with Node.js)
- A Bluesky account for testing OAuth
- A browser wallet (MetaMask, Rabby, etc.) for testing

### Getting Started

```bash
# Clone the repository
git clone https://github.com/piss-beauty/atproto-evm-link.git
cd atproto-evm-link

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

The server will start at `http://127.0.0.1:3333`.

### Environment Variables

For development, you only need:

```bash
COOKIE_SECRET=development-secret-at-least-32-chars!!
```

For WalletConnect support (optional):
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # Backend API endpoints
│   └── [pages]/           # Frontend pages
├── components/            # React components
│   └── steps/             # Wizard step components
├── hooks/                 # Custom React hooks
├── lib/                   # Core business logic
│   ├── auth/              # ATProto OAuth
│   ├── attestation.ts     # EIP-712 types
│   ├── pds.ts             # PDS operations
│   └── verify.ts          # Signature verification
└── providers/             # React context providers
```

### Key Concepts

#### 1. ATProto OAuth Flow

The OAuth flow uses `@atproto/oauth-client-node`:

```
/api/login          → Initiates OAuth, stores state in memory
/api/oauth/callback → Exchanges code for tokens, creates session
/api/status         → Returns current auth state
/api/logout         → Clears session
```

**Important:** OAuth state is stored in a global `Map` that persists across requests but NOT across server restarts. This is fine for development but requires Redis/database for production.

#### 2. EIP-712 Attestations

Attestations use EIP-712 typed data:

```typescript
const ATTESTATION_TYPES = {
  Attestation: [
    { name: 'did', type: 'string' },
    { name: 'evmAddress', type: 'address' },
    { name: 'chainId', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
}
```

This provides:
- Human-readable signing in wallets
- Replay protection via chainId + nonce
- Timestamp for freshness

#### 3. PDS Storage

Attestations are stored in the user's ATProto PDS using `putRecord`:

```typescript
await agent.com.atproto.repo.putRecord({
  repo: did,
  collection: 'org.impactindexer.link.attestation',
  rkey: `${address}-${chainId}`,
  record: attestation,
})
```

The `rkey` format allows one attestation per address+chain combination.

#### 4. Signature Verification

Three signature types are supported:

| Type | Standard | Verification Method |
|------|----------|---------------------|
| `eoa` | ECDSA | `ecrecover` from EIP-712 hash |
| `erc1271` | Smart Contract | Call `isValidSignature(hash, sig)` |
| `erc6492` | Counterfactual | Deploy + call `isValidSignature` |

## Code Style

### TypeScript

- **Strict mode** is enabled - no `any` types
- Use `type` imports for type-only imports
- Prefix unused variables with `_`

```typescript
// Good
import type { Address } from 'viem'
import { useAccount } from 'wagmi'

// Bad
import { Address } from 'viem'  // Should use `import type`
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `WalletButton.tsx` |
| Hooks | camelCase with `use` prefix | `useAttestationSigning.ts` |
| Utilities | camelCase | `createAttestationMessage` |
| Constants | SCREAMING_SNAKE_CASE | `ATTESTATION_COLLECTION` |
| Files | kebab-case or PascalCase | `attestation.ts`, `AuthButton.tsx` |

### Component Structure

```typescript
'use client'  // Only if needed

import { useState } from 'react'
import type { SomeType } from '@/lib/types'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function MyComponent({ value, onChange }: Props) {
  // Implementation
}
```

### Imports Order

1. `'use client'` directive (if needed)
2. React imports
3. Third-party imports
4. Internal imports (`@/...`)
5. Type imports

## Making Changes

### Branch Naming

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add support for ERC-6492 signatures
fix: handle OAuth state expiration gracefully
docs: update API reference
refactor: extract signature verification logic
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test these flows:

#### OAuth Flow
- [ ] Sign in with a Bluesky handle
- [ ] Verify session persists across page refresh
- [ ] Sign out clears session
- [ ] OAuth errors display correctly

#### Wallet Connection
- [ ] Connect MetaMask/Rabby
- [ ] Connect Coinbase Wallet
- [ ] Disconnect wallet works

#### Attestation Flow
- [ ] Sign EIP-712 message
- [ ] Attestation stored in PDS
- [ ] Success page shows share link

#### Verification
- [ ] Verify by handle works
- [ ] Verify by DID works
- [ ] Invalid signatures detected

#### Manage Page
- [ ] List existing attestations
- [ ] Unlink attestation works

### Linting

```bash
npm run lint
```

### Build Check

```bash
npm run build
```

## Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test manually** using the checklist above
4. **Run linting and build** to catch errors
5. **Write a clear PR description** explaining what and why
6. **Link any related issues**

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Tested OAuth flow
- [ ] Tested wallet connection
- [ ] Tested attestation creation
- [ ] Tested verification
- [ ] Lint passes
- [ ] Build passes

## Related Issues
Closes #123
```

## Adding New Features

### Adding a New Wallet Connector

1. Add connector to `src/lib/wagmi.ts`:

```typescript
import { myWallet } from 'wagmi/connectors'

connectors: [
  // ... existing connectors
  myWallet({
    // config
  }),
]
```

2. Add icon to `src/components/WalletButton.tsx`:

```typescript
export function MyWalletIcon({ className }: { className?: string }) {
  return <svg className={className}>...</svg>
}
```

3. Add button to `src/components/steps/WalletConnectStep.tsx`:

```typescript
<WalletButton
  connectorId="myWallet"
  name="My Wallet"
  icon={<MyWalletIcon />}
/>
```

### Adding a New Chain

1. Import chain from viem:

```typescript
import { myChain } from 'wagmi/chains'
```

2. Add to config in `src/lib/wagmi.ts`:

```typescript
chains: [base, optimism, mainnet, arbitrum, myChain],
transports: {
  // ... existing
  [myChain.id]: http('https://rpc.mychain.com'),
}
```

3. Add to `src/lib/chains.ts`:

```typescript
export function getChainName(chainId: number): string {
  switch (chainId) {
    // ... existing
    case 12345: return 'My Chain'
  }
}
```

### Adding a New Signature Type

1. Add type to `src/lib/attestation.ts`:

```typescript
export type SignatureType = 'eoa' | 'erc1271' | 'erc6492' | 'myType'
```

2. Add verification logic to `src/lib/verify.ts`:

```typescript
if (sigType === 'myType') {
  // Verification logic
}
```

3. Update lexicon (requires publishing):

```json
"signatureType": {
  "type": "string",
  "knownValues": ["eoa", "erc1271", "erc6492", "myType"]
}
```

## Questions?

- Open an issue for bugs or feature requests
- Join the discussion in [GainForest Discord](https://discord.gg/gainforest)
- Check existing issues before creating new ones

Thank you for contributing!
