<p align="center">
  <img src="public/logo.png" alt="Mull Logo" width="200" />
</p>

<h1 align="center">Mull - BNB Chain Transaction Explainer</h1>

<p align="center">
  <strong>Adding colors to the monotonous world of blockchain transactions.</strong>
</p>

<p align="center">
  <a href="https://github.com/leopard627/mull-bnb/actions/workflows/ci.yml">
    <img src="https://github.com/leopard627/mull-bnb/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/leopard627/mull-bnb/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/leopard627/mull-bnb" alt="License" />
  </a>
</p>

<p align="center">
  <a href="https://bnb.mull.live">Live Demo</a> •
  <a href="https://x.com/getMullWeb3">Twitter</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

## Our Mission

> **"Adding colors to the monotonous world of blockchain transactions."**

Blockchain transactions are often displayed as plain, monotonous data - just hashes, addresses, and numbers. We believe this doesn't have to be the case.

Just as watercolors bring life to a blank canvas, **Mull adds vibrant colors and visual clarity** to help anyone understand what's happening in a transaction. We transform cryptic on-chain data into intuitive, colorful visualizations that tell a story.

Our goal is simple: **Make blockchain transactions accessible to everyone**, whether you're a developer debugging a smart contract or a newcomer exploring your first transaction.

---

Mull is a user-friendly web app that takes a BNB Chain transaction hash and explains in plain language what actually happened.

## Features

- **Human-readable explanations**: Transforms complex transaction data into simple summaries like "Alice transferred 10 BNB to Bob"
- **Visual flow diagrams**: See the flow of assets with sender → recipient arrows
- **Multi-network support**: Works with both Mainnet and Testnet
- **Transaction type detection**: Automatically identifies transfers, swaps, mints, staking, and more
- **Contract call details**: Clear labels for contracts and functions involved
- **Gas breakdown**: See exactly how much gas was used
- **Wallet connection**: Connect your wallet to view your transaction history

## Supported Transaction Types

| Type | Example Summary |
|------|----------------|
| Transfer | "0x1a2b... transferred 0.5 BNB to 0x3c4d..." |
| Token Transfer | "0x1a2b... transferred 100 USDT to 0x3c4d..." |
| DEX Swap | "0x1a2b... swapped 100 USDC for 50 BNB on PancakeSwap" |
| Approval | "0x1a2b... approved unlimited USDT for PancakeSwap" |
| Liquidity | "0x1a2b... added liquidity to BNB/USDT pool" |
| Stake | "0x1a2b... staked 100 CAKE" |
| Bridge | "0x1a2b... bridged 1 ETH to Ethereum via LayerZero" |
| Contract Deploy | "0x1a2b... deployed a new smart contract" |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Blockchain**: viem, wagmi, RainbowKit

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/leopard627/mull-bnb.git
cd mull-bnb

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
BSCSCAN_API_KEY=your_api_key
```

### Usage

1. Paste a BNB Chain transaction hash into the input field
2. Select the network (Mainnet or Testnet)
3. Click "Explain" to see the transaction breakdown
4. Connect your wallet to view your transaction history

## Architecture

```
app/
├── page.tsx                    # Main page
├── layout.tsx                  # Root layout with metadata
├── api/                        # API routes
│   ├── transaction/[digest]/   # Transaction data endpoint
│   ├── transactions/recent/    # Recent transactions endpoint
│   └── stats/                  # Network stats endpoint
├── components/                 # React components
│   ├── TransactionInput.tsx    # Input field + network selector
│   ├── TransactionExplainer.tsx # Main container
│   ├── TransactionSummary.tsx  # Human-readable summary
│   ├── TransactionFlow.tsx     # Visual flow diagram (React Flow)
│   ├── BalanceChanges.tsx      # Token balance changes
│   ├── ConnectWallet.tsx       # Wallet connection button
│   └── ...
└── providers/
    └── WalletProvider.tsx      # Wagmi + RainbowKit provider

lib/
├── bnb-client.ts              # BNB Chain RPC client (viem)
├── explanation-engine.ts      # Transaction parsing & explanation
├── known-packages.ts          # Known DEX/Protocol registry
├── token-images.ts            # Token metadata & images
├── format-utils.ts            # Formatting utilities
└── types.ts                   # TypeScript interfaces
```

## Data Sources

- **BNB Chain RPC**: Transaction data is fetched from public RPC endpoints
  - Mainnet: `https://bsc-dataseed.binance.org`
  - Testnet: `https://data-seed-prebsc-1-s1.binance.org:8545`

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with love for the BNB Chain ecosystem
- Inspired by the need for better blockchain UX
