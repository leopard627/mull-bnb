/**
 * Parse explorer URLs to extract transaction hash or address and network
 *
 * Supported URL formats:
 * - BSCScan mainnet: https://bscscan.com/tx/HASH
 * - BSCScan testnet: https://testnet.bscscan.com/tx/HASH
 * - BSCScan mainnet address: https://bscscan.com/address/ADDRESS
 * - BSCScan testnet address: https://testnet.bscscan.com/address/ADDRESS
 */

import type { Network } from "./types";

export type InputType = "transaction" | "address";

export interface ParsedInput {
  value: string;
  network: Network;
  type: InputType;
}

// Legacy interface for backward compatibility
export interface ParsedUrl {
  digest: string;
  network: Network;
}

/**
 * Check if a string looks like a URL
 */
export function isUrl(input: string): boolean {
  return input.startsWith("http://") || input.startsWith("https://");
}

/**
 * Check if a string looks like a valid EVM transaction hash
 * EVM hashes are 66 characters (0x + 64 hex chars)
 */
export function isValidDigest(input: string): boolean {
  const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
  return txHashRegex.test(input);
}

/**
 * Check if a string looks like a valid EVM address
 * EVM addresses are 42 characters (0x + 40 hex chars)
 */
export function isValidAddress(input: string): boolean {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(input);
}

/**
 * Parse a BSCScan URL
 * Formats:
 * - Mainnet tx: https://bscscan.com/tx/{hash}
 * - Testnet tx: https://testnet.bscscan.com/tx/{hash}
 * - Mainnet address: https://bscscan.com/address/{address}
 * - Testnet address: https://testnet.bscscan.com/address/{address}
 */
function parseBscScanUrl(url: URL): ParsedInput | null {
  // Check if it's bscscan.com
  if (!url.hostname.includes("bscscan.com")) return null;

  // Determine network from subdomain
  const network: Network = url.hostname.startsWith("testnet.") ? "testnet" : "mainnet";

  // Path format: /tx/{hash} or /address/{address}
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length >= 2) {
    if (pathParts[0] === "tx") {
      const hash = pathParts[1];
      if (isValidDigest(hash)) {
        return { value: hash, network, type: "transaction" };
      }
    } else if (pathParts[0] === "address") {
      const address = pathParts[1];
      if (isValidAddress(address)) {
        return { value: address, network, type: "address" };
      }
    }
  }

  return null;
}

/**
 * Parse input that could be a URL, raw hash, or address
 * Returns the value, detected network, and input type
 */
export function parseInput(
  input: string,
  defaultNetwork: Network = "mainnet"
): ParsedInput | null {
  const trimmed = input.trim();

  if (!trimmed) return null;

  // Try to parse as URL
  if (isUrl(trimmed)) {
    try {
      const url = new URL(trimmed);

      // Try BSCScan
      const bscscanResult = parseBscScanUrl(url);
      if (bscscanResult) return bscscanResult;

      // Unknown URL format
      return null;
    } catch {
      // Invalid URL
      return null;
    }
  }

  // Try as raw transaction hash (66 chars: 0x + 64 hex)
  if (isValidDigest(trimmed)) {
    return { value: trimmed, network: defaultNetwork, type: "transaction" };
  }

  // Try as raw address (42 chars: 0x + 40 hex)
  if (isValidAddress(trimmed)) {
    return { value: trimmed, network: defaultNetwork, type: "address" };
  }

  return null;
}

/**
 * Parse input that could be a URL or a raw hash (legacy function for backward compatibility)
 * Returns the hash and detected network
 */
export function parseTransactionInput(
  input: string,
  defaultNetwork: Network = "mainnet"
): ParsedUrl | null {
  const result = parseInput(input, defaultNetwork);

  if (result && result.type === "transaction") {
    return { digest: result.value, network: result.network };
  }

  // For backward compatibility, also return addresses as digests
  // This allows the existing code to handle addresses
  if (result && result.type === "address") {
    return { digest: result.value, network: result.network };
  }

  return null;
}

/**
 * Get a display-friendly version of the input
 * (shortened hash or original URL)
 */
export function getInputDisplayName(input: string): string {
  const trimmed = input.trim();

  if (isUrl(trimmed)) {
    const parsed = parseTransactionInput(trimmed);
    if (parsed) {
      return `${parsed.digest.slice(0, 10)}...${parsed.digest.slice(-8)}`;
    }
    return trimmed;
  }

  if (trimmed.length > 20) {
    return `${trimmed.slice(0, 10)}...${trimmed.slice(-8)}`;
  }

  return trimmed;
}
