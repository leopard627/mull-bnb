// Token image registry for BNB Chain ecosystem

export interface TokenInfo {
  symbol: string;
  name: string;
  image: string;
  decimals: number;
}

// Main token registry - contract address to token info
const TOKEN_REGISTRY: Record<string, TokenInfo> = {
  // Native BNB (represented as special address)
  native: {
    symbol: "BNB",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    decimals: 18,
  },

  // Wrapped BNB
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": {
    symbol: "WBNB",
    name: "Wrapped BNB",
    image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    decimals: 18,
  },

  // Stablecoins
  "0x55d398326f99059ff775485246999027b3197955": {
    symbol: "USDT",
    name: "Tether USD",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    decimals: 18,
  },
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": {
    symbol: "USDC",
    name: "USD Coin",
    image: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    decimals: 18,
  },
  "0xe9e7cea3dedca5984780bafc599bd69add087d56": {
    symbol: "BUSD",
    name: "Binance USD",
    image: "https://assets.coingecko.com/coins/images/9576/small/BUSD.png",
    decimals: 18,
  },
  "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3": {
    symbol: "DAI",
    name: "Dai Stablecoin",
    image: "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png",
    decimals: 18,
  },
  "0x14016e85a25aeb13065688cafb43044c2ef86784": {
    symbol: "TUSD",
    name: "TrueUSD",
    image: "https://assets.coingecko.com/coins/images/3449/small/tusd.png",
    decimals: 18,
  },

  // Major Tokens
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8": {
    symbol: "ETH",
    name: "Ethereum Token",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    decimals: 18,
  },
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c": {
    symbol: "BTCB",
    name: "Bitcoin BEP20",
    image: "https://assets.coingecko.com/coins/images/14108/small/Binance-bitcoin.png",
    decimals: 18,
  },
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": {
    symbol: "CAKE",
    name: "PancakeSwap",
    image: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png",
    decimals: 18,
  },

  // DeFi Tokens
  "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63": {
    symbol: "XVS",
    name: "Venus",
    image: "https://assets.coingecko.com/coins/images/13161/small/venus.png",
    decimals: 18,
  },
  "0x8f0528ce5ef7b51152a59745befdd91d97091d2f": {
    symbol: "ALPACA",
    name: "Alpaca Finance",
    image: "https://assets.coingecko.com/coins/images/14165/small/alpaca.png",
    decimals: 18,
  },
  "0x965f527d9159dce6288a2219db51fc6eef120dd1": {
    symbol: "BSW",
    name: "BiSwap",
    image: "https://assets.coingecko.com/coins/images/16845/small/biswap.png",
    decimals: 18,
  },
  "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95": {
    symbol: "BANANA",
    name: "ApeSwap",
    image: "https://assets.coingecko.com/coins/images/14870/small/banana.png",
    decimals: 18,
  },

  // Meme Tokens
  "0xba2ae424d960c26247dd6c32edc70b295c744c43": {
    symbol: "DOGE",
    name: "Dogecoin",
    image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    decimals: 8,
  },
  "0x2859e4544c4bb03966803b044a93563bd2d0dd4d": {
    symbol: "SHIB",
    name: "Shiba Inu",
    image: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
    decimals: 18,
  },
  "0x4a2c860cecb1bf77348a6ed5ebd81d7c2b1a9533": {
    symbol: "FLOKI",
    name: "Floki Inu",
    image: "https://assets.coingecko.com/coins/images/16746/small/floki.png",
    decimals: 9,
  },

  // Liquid Staking
  "0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b": {
    symbol: "stkBNB",
    name: "Staked BNB",
    image: "https://assets.coingecko.com/coins/images/26727/small/stkBNB.png",
    decimals: 18,
  },
  "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275": {
    symbol: "BNBx",
    name: "Stader BNBx",
    image: "https://assets.coingecko.com/coins/images/26758/small/BNBx.png",
    decimals: 18,
  },

  // Other Popular Tokens
  "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47": {
    symbol: "ADA",
    name: "Cardano Token",
    image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    decimals: 18,
  },
  "0x7083609fce4d1d8dc0c979aab8c869ea2c873402": {
    symbol: "DOT",
    name: "Polkadot Token",
    image: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
    decimals: 18,
  },
  "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe": {
    symbol: "XRP",
    name: "XRP Token",
    image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    decimals: 18,
  },
  "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd": {
    symbol: "LINK",
    name: "Chainlink",
    image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    decimals: 18,
  },
  "0x4338665cbb7b2485a8855a139b75d5e34ab0db94": {
    symbol: "LTC",
    name: "Litecoin Token",
    image: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
    decimals: 18,
  },
  "0xcc42724c6683b7e57334c4e856f4c9965ed682bd": {
    symbol: "MATIC",
    name: "Polygon",
    image: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    decimals: 18,
  },
  "0x1ce0c2827e2ef14d5c4f29a091d735a204794041": {
    symbol: "AVAX",
    name: "Avalanche",
    image:
      "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    decimals: 18,
  },
};

// Create lowercase lookup map for case-insensitive matching
const TOKEN_LOOKUP = Object.fromEntries(
  Object.entries(TOKEN_REGISTRY).map(([key, value]) => [key.toLowerCase(), value])
);

export function getTokenInfo(address: string): TokenInfo | null {
  if (!address) return null;

  // Handle special cases
  if (address === "native" || address === "0x0000000000000000000000000000000000000000") {
    return TOKEN_REGISTRY.native;
  }

  return TOKEN_LOOKUP[address.toLowerCase()] || null;
}

export function getTokenSymbol(address: string): string {
  const info = getTokenInfo(address);
  return info?.symbol || address.slice(0, 10) + "...";
}

export function getTokenDecimals(address: string): number {
  const info = getTokenInfo(address);
  return info?.decimals || 18;
}

export function getTokenImage(address: string): string | null {
  const info = getTokenInfo(address);
  return info?.image || null;
}
