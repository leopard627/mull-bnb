import { createPublicClient, http, type PublicClient } from "viem";
import { bsc, bscTestnet } from "viem/chains";
import type { Network } from "./types";

// Use reliable RPC endpoints
const clients: Record<Network, PublicClient> = {
  mainnet: createPublicClient({
    chain: bsc,
    transport: http("https://bsc-dataseed1.binance.org"),
  }),
  testnet: createPublicClient({
    chain: bscTestnet,
    transport: http("https://data-seed-prebsc-1-s1.binance.org:8545"),
  }),
};

export function getBnbClient(network: Network): PublicClient {
  return clients[network];
}

export function isValidTransactionHash(hash: string): boolean {
  // BNB/EVM transaction hashes are 66 characters (0x + 64 hex chars)
  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  return txHashRegex.test(hash);
}

export function isValidAddress(address: string): boolean {
  // BNB/EVM addresses are 42 characters (0x + 40 hex chars)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

export { bsc, bscTestnet };
