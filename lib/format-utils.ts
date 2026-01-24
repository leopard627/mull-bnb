const BNB_DECIMALS = 18;

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "Unknown";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBnbAmount(amount: string | number | bigint): string {
  const value = BigInt(amount);
  const bnb = Number(value) / Math.pow(10, BNB_DECIMALS);

  if (bnb === 0) return "0";
  if (bnb < 0.0001) return "< 0.0001";
  if (bnb < 1) return bnb.toFixed(4);
  if (bnb < 1000) return bnb.toFixed(4);
  if (bnb < 1000000) return `${(bnb / 1000).toFixed(2)}K`;
  return `${(bnb / 1000000).toFixed(2)}M`;
}

export function formatTokenAmount(amount: string | number | bigint, decimals: number = 18): string {
  const value = BigInt(amount);
  const formatted = Number(value) / Math.pow(10, decimals);

  if (formatted === 0) return "0";
  if (Math.abs(formatted) < 0.0001) return formatted > 0 ? "< 0.0001" : "> -0.0001";
  if (Math.abs(formatted) < 1) return formatted.toFixed(4);
  if (Math.abs(formatted) < 1000) return formatted.toFixed(2);
  if (Math.abs(formatted) < 1000000) return `${(formatted / 1000).toFixed(2)}K`;
  return `${(formatted / 1000000).toFixed(2)}M`;
}

export function extractTokenSymbol(
  contractAddress: string,
  knownTokens?: Record<string, string>
): string {
  // For EVM, we look up contract address in known tokens registry
  if (knownTokens && knownTokens[contractAddress.toLowerCase()]) {
    return knownTokens[contractAddress.toLowerCase()];
  }
  return shortenAddress(contractAddress);
}

export function formatTimestamp(timestamp: string | number | null): string {
  if (!timestamp) return "Unknown";

  // EVM timestamps are in seconds, not milliseconds
  const timestampNum = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(timestampNum * 1000);
  return date.toLocaleString();
}

export function getInitials(address: string): string {
  if (!address || address === "Unknown") return "?";
  // Use first 2 hex chars after 0x
  return address.slice(2, 4).toUpperCase();
}

export function getTokenDecimals(_tokenAddress: string): number {
  // Native BNB uses 18 decimals
  // Most BEP-20 tokens also use 18 decimals
  // USDC/USDT typically use 18 on BNB Chain (unlike 6 on Ethereum)
  // USDT on BNB Chain: 0x55d398326f99059ff775485246999027b3197955 (18 decimals)
  // USDC on BNB Chain: 0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d (18 decimals)
  // BUSD: 0xe9e7cea3dedca5984780bafc599bd69add087d56 (18 decimals)

  return 18;
}

export function formatGwei(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  if (gwei < 0.001) return "< 0.001";
  if (gwei < 1) return gwei.toFixed(3);
  return gwei.toFixed(1);
}

export function formatUsd(amount: number): string {
  if (amount < 0.01) return "< $0.01";
  if (amount < 1000) return `$${amount.toFixed(2)}`;
  if (amount < 1000000) return `$${(amount / 1000).toFixed(2)}K`;
  return `$${(amount / 1000000).toFixed(2)}M`;
}

export function extractTypeName(objectType: string): string {
  // For EVM, object types are typically contract addresses
  // Just return a shortened version or the full type if it's short
  if (!objectType) return "Unknown";
  if (objectType.length <= 20) return objectType;
  return shortenAddress(objectType, 8);
}
