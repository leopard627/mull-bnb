export interface ProtocolInfo {
  name: string;
  description: string;
  website?: string;
  logo?: string;
}

// Known DEXes on BNB Chain
export const KNOWN_DEXES: Record<string, ProtocolInfo> = {
  // PancakeSwap
  "0x10ed43c718714eb63d5aa57b78b54704e256024e": {
    name: "PancakeSwap",
    description: "PancakeSwap V2 Router",
    website: "https://pancakeswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  },
  "0x13f4ea83d0bd40e75c8222255bc855a974568dd4": {
    name: "PancakeSwap V3",
    description: "PancakeSwap V3 Router",
    website: "https://pancakeswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  },
  "0x556b9306565093c855aea9ae92a594704c2cd59e": {
    name: "PancakeSwap",
    description: "PancakeSwap Smart Router",
    website: "https://pancakeswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  },

  // BiSwap
  "0x3a6d8ca21d1cf76f653a67577fa0d27453350dd8": {
    name: "BiSwap",
    description: "BiSwap Router",
    website: "https://biswap.org",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/10746.png",
  },

  // ApeSwap
  "0xcf0febd3f17cef5b47b0cd257acf6025c5bff3b7": {
    name: "ApeSwap",
    description: "ApeSwap Router",
    website: "https://apeswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/8497.png",
  },

  // BabySwap
  "0x325e343f1de602396e256b67efd1f61c3a6b38bd": {
    name: "BabySwap",
    description: "BabySwap Router",
    website: "https://babyswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/10334.png",
  },

  // MDEX
  "0x7dae51bd3e3376b8c7c4900e9107f12be3af1ba8": {
    name: "MDEX",
    description: "MDEX Router",
    website: "https://mdex.com",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/8335.png",
  },

  // DODO
  "0x8f8dd7db1bda5ed3da8c9daf3bfa471c12d58486": {
    name: "DODO",
    description: "DODO Router",
    website: "https://dodoex.io",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7224.png",
  },

  // 1inch
  "0x1111111254eeb25477b68fb85ed929f73a960582": {
    name: "1inch",
    description: "1inch Aggregator V5",
    website: "https://1inch.io",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/8104.png",
  },

  // Uniswap V3 (on BNB)
  "0xb971ef87ede563556b2ed4b1c0b0019111dd85d2": {
    name: "Uniswap V3",
    description: "Uniswap V3 Router",
    website: "https://uniswap.org",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
  },
};

// Known Lending Protocols
export const KNOWN_LENDING: Record<string, ProtocolInfo> = {
  // Venus Protocol
  "0xfd36e2c2a6789db23113685031d7f16329158384": {
    name: "Venus",
    description: "Venus Comptroller",
    website: "https://venus.io",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7288.png",
  },
  "0xecf44e2c4eaccddb7c5b9e6c4e3c7a6e8e2e7c6d": {
    name: "Venus",
    description: "Venus vToken",
    website: "https://venus.io",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7288.png",
  },

  // Alpaca Finance
  "0xa625ab01b08ce023b2a342dbb12a16f2c8489a8f": {
    name: "Alpaca Finance",
    description: "Alpaca Lending",
    website: "https://alpacafinance.org",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/8707.png",
  },

  // Cream Finance
  "0x589de0f0ccf905477646599bb3e5c622c84cc0ba": {
    name: "Cream Finance",
    description: "Cream Comptroller",
    website: "https://cream.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/6193.png",
  },

  // Radiant Capital
  "0xd50cf00b6e600dd036ba8ef475677d816d6c4281": {
    name: "Radiant Capital",
    description: "Radiant Lending",
    website: "https://radiant.capital",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/21106.png",
  },
};

// Known NFT Marketplaces
export const KNOWN_NFT_MARKETPLACES: Record<string, ProtocolInfo> = {
  // OpenSea Seaport
  "0x00000000006c3852cbef3e08e8df289169ede581": {
    name: "OpenSea",
    description: "Seaport Protocol",
    website: "https://opensea.io",
    logo: "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png",
  },
  "0x00000000000000adc04c56bf30ac9d3c0aaf14dc": {
    name: "OpenSea",
    description: "Seaport 1.5",
    website: "https://opensea.io",
    logo: "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png",
  },

  // NFTKey
  "0x8c07326a6e0a13a1d8e5e8fb1e8fa4a8e1f8e4c1": {
    name: "NFTKey",
    description: "NFTKey Marketplace",
    website: "https://nftkey.app",
  },

  // Element
  "0x20f780a973856b93f63670377900c1d2a50a77c4": {
    name: "Element",
    description: "Element Market",
    website: "https://element.market",
  },

  // TofuNFT
  "0x7bc8b1b5aba4df3be9f9a32dae501214dc0e0f3a": {
    name: "TofuNFT",
    description: "TofuNFT Marketplace",
    website: "https://tofunft.com",
  },
};

// Known Staking Protocols
export const KNOWN_STAKING: Record<string, ProtocolInfo> = {
  // PancakeSwap Staking
  "0x45c54210128a065de780c4b0df3d16664f7f859e": {
    name: "PancakeSwap CAKE Pool",
    description: "CAKE Staking Pool",
    website: "https://pancakeswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  },
  "0xa5f8c5dbd5f286960b9d90548680ae5ebff07652": {
    name: "PancakeSwap Farms",
    description: "PancakeSwap LP Staking",
    website: "https://pancakeswap.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  },

  // Binance Staking
  "0x0000000000000000000000000000000000001000": {
    name: "BNB Staking",
    description: "Native BNB Staking",
    website: "https://www.bnbchain.org",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  },

  // Lista DAO (Liquid Staking)
  "0x1adb950d8bb3da4be104211d5ab038628e477fe6": {
    name: "Lista DAO",
    description: "BNB Liquid Staking",
    website: "https://lista.org",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/30407.png",
  },

  // Ankr Staking
  "0x52f24a5e03aee338da5fd9df68d2b6fae1178827": {
    name: "Ankr Staking",
    description: "Ankr BNB Liquid Staking",
    website: "https://ankr.com",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/3783.png",
  },

  // Stader
  "0x7276241a669489e4bbb76f63d2a43bfe63080f2f": {
    name: "Stader",
    description: "Stader BNB Staking",
    website: "https://staderlabs.com",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/21200.png",
  },
};

// Known Bridges
export const KNOWN_BRIDGES: Record<string, ProtocolInfo> = {
  // Multichain
  "0xf9736ec3926703e85c843fc972bd89a7f8e827c0": {
    name: "Multichain",
    description: "Multichain Bridge",
    website: "https://multichain.org",
  },

  // Celer cBridge
  "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af": {
    name: "Celer cBridge",
    description: "Celer Network Bridge",
    website: "https://cbridge.celer.network",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/3814.png",
  },

  // Stargate
  "0x4a364f8c717cad9a558c0a1e78c30a3c2c1e18e0": {
    name: "Stargate",
    description: "Stargate Bridge",
    website: "https://stargate.finance",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/18934.png",
  },

  // Wormhole
  "0x98f3c9e6e3face36baad05fe09d375ef1464288b": {
    name: "Wormhole",
    description: "Wormhole Bridge",
    website: "https://wormhole.com",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/21638.png",
  },
};

// All known protocols combined
export const KNOWN_PROTOCOLS: Record<string, ProtocolInfo> = {
  ...KNOWN_DEXES,
  ...KNOWN_LENDING,
  ...KNOWN_NFT_MARKETPLACES,
  ...KNOWN_STAKING,
  ...KNOWN_BRIDGES,
};

// Helper functions
export function getProtocolName(address: string): string | null {
  const protocol = KNOWN_PROTOCOLS[address.toLowerCase()];
  return protocol?.name || null;
}

export function identifyDex(address: string): string | null {
  const dex = KNOWN_DEXES[address.toLowerCase()];
  return dex?.name || null;
}

export function identifyLendingProtocol(address: string): string | null {
  const lending = KNOWN_LENDING[address.toLowerCase()];
  return lending?.name || null;
}

export function identifyNftMarketplace(address: string): string | null {
  const marketplace = KNOWN_NFT_MARKETPLACES[address.toLowerCase()];
  return marketplace?.name || null;
}

export function identifyBridge(address: string): string | null {
  const bridge = KNOWN_BRIDGES[address.toLowerCase()];
  return bridge?.name || null;
}

export function identifyStaking(address: string): string | null {
  const staking = KNOWN_STAKING[address.toLowerCase()];
  return staking?.name || null;
}

export function getProtocolInfo(address: string): ProtocolInfo | null {
  return KNOWN_PROTOCOLS[address.toLowerCase()] || null;
}

export function getDexLogo(address: string): string | null {
  const dex = KNOWN_DEXES[address.toLowerCase()];
  return dex?.logo || null;
}

export function getBridgeLogo(address: string): string | null {
  const bridge = KNOWN_BRIDGES[address.toLowerCase()];
  return bridge?.logo || null;
}

export function getLendingLogo(address: string): string | null {
  const lending = KNOWN_LENDING[address.toLowerCase()];
  return lending?.logo || null;
}

export function getStakingLogo(address: string): string | null {
  const staking = KNOWN_STAKING[address.toLowerCase()];
  return staking?.logo || null;
}
