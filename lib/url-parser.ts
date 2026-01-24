/**
 * Parse explorer URLs to extract transaction hash and network
 *
 * Supported URL formats:
 * - BSCScan mainnet: https://bscscan.com/tx/HASH
 * - BSCScan testnet: https://testnet.bscscan.com/tx/HASH
 */

import type { Network } from "./types";

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
 * Parse a BSCScan URL
 * Formats:
 * - Mainnet: https://bscscan.com/tx/{hash}
 * - Testnet: https://testnet.bscscan.com/tx/{hash}
 */
function parseBscScanUrl(url: URL): ParsedUrl | null {
  // Check if it's bscscan.com
  if (!url.hostname.includes("bscscan.com")) return null;

  // Determine network from subdomain
  const network: Network = url.hostname.startsWith("testnet.") ? "testnet" : "mainnet";

  // Path format: /tx/{hash}
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length >= 2 && pathParts[0] === "tx") {
    const hash = pathParts[1];

    if (isValidDigest(hash)) {
      return { digest: hash, network };
    }
  }

  return null;
}

/**
 * Parse input that could be a URL or a raw hash
 * Returns the hash and detected network
 */
export function parseTransactionInput(
  input: string,
  defaultNetwork: Network = "mainnet"
): ParsedUrl | null {
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

  // Try as raw hash
  if (isValidDigest(trimmed)) {
    return { digest: trimmed, network: defaultNetwork };
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
