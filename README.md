# ATProto-EVM Link

Link your Bluesky identity to your Ethereum wallet. Create verifiable connections between your social identity and blockchain address.

## Features

- **ATProto OAuth** - Secure authentication via Bluesky
- **Multi-chain support** - Ethereum, Base, Optimism, Arbitrum
- **Smart wallet support** - Works with EOA, Coinbase Smart Wallet, Safe multisigs
- **EIP-712 signatures** - Human-readable, typed data signing
- **Decentralized storage** - Attestations stored in user's ATProto PDS
- **On-demand verification** - Anyone can verify linked identities

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://127.0.0.1:3000 to use the app.

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Required
COOKIE_SECRET=your-secret-at-least-32-characters-long

# For WalletConnect support
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Better RPC endpoints
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# Production only
PUBLIC_URL=https://link.piss.beauty
ATPROTO_JWK_PRIVATE={"kty":"EC",...}  # Generate with: node scripts/generate-jwk.js
```

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes
│   │   ├── attestations/     # Store/fetch attestations
│   │   ├── login/            # Initiate OAuth flow
│   │   ├── logout/           # Clear session
│   │   ├── oauth/            # OAuth callback, client metadata
│   │   └── verify/           # Verification endpoint
│   ├── link/                 # Linking wizard
│   └── verify/               # Verification page
├── components/
│   ├── steps/                # Wizard step components
│   └── ...                   # Shared UI components
├── hooks/
│   ├── useAttestationSigning.ts
│   └── useWalletType.ts
├── lib/
│   ├── auth/                 # ATProto OAuth client
│   ├── attestation.ts        # EIP-712 types
│   ├── pds.ts                # PDS storage helpers
│   ├── verify.ts             # Signature verification
│   └── wagmi.ts              # Wallet config
└── providers/
    └── WagmiProvider.tsx
```

## How It Works

1. **User authenticates** with their ATProto identity (Bluesky)
2. **User connects** their EVM wallet
3. **User signs** an EIP-712 attestation message
4. **Attestation is stored** in the user's ATProto PDS
5. **Anyone can verify** by fetching the attestation and checking the signature

## Supported Wallets

- **Coinbase Smart Wallet** - Passkey-based, no seed phrase
- **MetaMask** - Browser extension
- **WalletConnect** - Mobile wallets
- **Safe** - Multisig wallets
- **Other injected wallets**

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- wagmi + viem for Ethereum
- @atproto/api + @atproto/oauth-client-node for ATProto
- iron-session for encrypted cookies

## License

MIT
