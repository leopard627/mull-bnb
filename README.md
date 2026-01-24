<p align="center">
  <img src="public/logo.png" alt="Mull Logo" width="200" />
</p>

<h1 align="center">Mull - Sui Transaction Explainer</h1>

<p align="center">
  <strong>"Mull" means "water" in Korean, perfectly matching Sui's water theme.</strong>
</p>

<p align="center">
  <a href="https://github.com/leopard627/mull/actions/workflows/ci.yml">
    <img src="https://github.com/leopard627/mull/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/leopard627/mull/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/leopard627/mull" alt="License" />
  </a>
</p>

<p align="center">
  <a href="https://mull.live">Live Demo</a> •
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

Mull is a user-friendly web app that takes a Sui transaction digest and explains in plain language what actually happened.

## Features

- **Human-readable explanations**: Transforms complex transaction data into simple summaries like "Alice transferred 10 SUI to Bob"
- **Visual flow diagrams**: See the flow of assets with sender → recipient arrows
- **Multi-network support**: Works with both Mainnet and Testnet
- **Transaction type detection**: Automatically identifies transfers, swaps, mints, staking, and more
- **Move call details**: Clear labels for packages, modules, and functions involved
- **Gas breakdown**: See exactly how much gas was used

## Supported Transaction Types

| Type | Example Summary |
|------|----------------|
| Transfer | "0x1a2b... transferred 0.5 SUI to 0x3c4d..." |
| NFT Transfer | "0x1a2b... transferred Suifrens #1234 to 0x3c4d..." |
| DEX Swap | "0x1a2b... swapped 100 USDC for 50 SUI on Cetus" |
| Mint | "0x1a2b... minted a new NFT" |
| Stake | "0x1a2b... staked 100 SUI" |
| Package Publish | "0x1a2b... deployed a new Move package" |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Blockchain SDK**: @mysten/sui

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/leopard627/mull.git
cd mull

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. Paste a Sui transaction digest (hash) into the input field
2. Select the network (Mainnet or Testnet)
3. Click "Explain" to see the transaction breakdown
4. Use "Explain Another" to analyze more transactions

## Architecture

```
app/
├── page.tsx                    # Main page
├── api/transaction/[digest]/   # API route for fetching transactions
└── components/                 # React components
    ├── TransactionInput.tsx    # Input field + network selector
    ├── TransactionExplainer.tsx # Main container
    ├── TransactionSummary.tsx  # Human-readable summary
    ├── TransactionFlow.tsx     # Visual flow diagram
    └── ...

lib/
├── sui-client.ts              # Sui RPC client
├── explanation-engine.ts      # Template-based explanation generator
├── known-packages.ts          # Well-known package registry
└── types.ts                   # TypeScript interfaces
```

## Data Sources

- **Sui RPC**: Transaction data is fetched directly from Sui's public RPC endpoints
  - Mainnet: `https://fullnode.mainnet.sui.io`
  - Testnet: `https://fullnode.testnet.sui.io`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the [Sui Foundation RFP Program](https://sui.io/)
- Inspired by the need for better blockchain UX
