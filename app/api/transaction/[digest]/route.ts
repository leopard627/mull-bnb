import { type NextRequest, NextResponse } from "next/server";
import { getBnbClient, isValidTransactionHash } from "@/lib/bnb-client";
import { parseTransaction } from "@/lib/explanation-engine";
import { getTokenInfo } from "@/lib/token-images";
import type { Network, TransactionError } from "@/lib/types";

interface TokenMetadata {
  address: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  imgUrl: string | null;
  source: "local" | "api" | "unknown";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ digest: string }> }
) {
  const { digest: txHash } = await params;
  const searchParams = request.nextUrl.searchParams;
  const network = (searchParams.get("network") || "mainnet") as Network;

  // Validate network
  if (network !== "mainnet" && network !== "testnet") {
    const error: TransactionError = {
      type: "INVALID_DIGEST",
      message: "Invalid network. Use 'mainnet' or 'testnet'.",
    };
    return NextResponse.json({ error }, { status: 400 });
  }

  // Validate transaction hash format
  if (!isValidTransactionHash(txHash)) {
    const error: TransactionError = {
      type: "INVALID_DIGEST",
      message: "Invalid transaction hash format. Expected a 66-character hex string (0x...).",
    };
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const client = getBnbClient(network);

    // Fetch transaction and receipt in parallel
    const [transaction, receipt] = await Promise.all([
      client.getTransaction({ hash: txHash as `0x${string}` }),
      client.getTransactionReceipt({ hash: txHash as `0x${string}` }),
    ]);

    if (!transaction || !receipt) {
      const error: TransactionError = {
        type: "NOT_FOUND",
        message: "Transaction not found. Check the hash and network.",
      };
      return NextResponse.json({ error }, { status: 404 });
    }

    // Get block for timestamp
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });

    const parsed = parseTransaction(transaction, receipt, block);

    // Extract token addresses from logs (Transfer events)
    const tokenAddresses = new Set<string>();
    for (const log of receipt.logs) {
      // ERC20 Transfer event: Transfer(address,address,uint256)
      if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
        tokenAddresses.add(log.address.toLowerCase());
      }
    }

    // Fetch token metadata
    const tokenMetadata: Record<string, TokenMetadata> = {};
    for (const address of tokenAddresses) {
      const localInfo = getTokenInfo(address);
      if (localInfo) {
        tokenMetadata[address] = {
          address,
          symbol: localInfo.symbol,
          name: localInfo.name,
          decimals: localInfo.decimals,
          imgUrl: localInfo.image,
          source: "local",
        };
      } else {
        tokenMetadata[address] = {
          address,
          symbol: null,
          name: null,
          decimals: null,
          imgUrl: null,
          source: "unknown",
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      tokenMetadata,
      network,
    });
  } catch (error: unknown) {
    console.error("Transaction fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("not found") || errorMessage.includes("could not be found")) {
      const txError: TransactionError = {
        type: "NOT_FOUND",
        message: "Transaction not found. Check the hash and network.",
      };
      return NextResponse.json({ error: txError }, { status: 404 });
    }

    if (errorMessage.includes("rate limit")) {
      const txError: TransactionError = {
        type: "RATE_LIMITED",
        message: "Rate limited. Please try again later.",
      };
      return NextResponse.json({ error: txError }, { status: 429 });
    }

    const txError: TransactionError = {
      type: "NETWORK_ERROR",
      message: "Failed to fetch transaction. Please try again.",
    };
    return NextResponse.json({ error: txError }, { status: 500 });
  }
}
