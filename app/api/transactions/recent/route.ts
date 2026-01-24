import { NextResponse } from "next/server";
import { getBnbClient } from "@/lib/bnb-client";
import type { Network } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = (searchParams.get("network") || "mainnet") as Network;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  try {
    const client = getBnbClient(network);

    // Get latest block with transaction details
    const latestBlock = await client.getBlock({
      includeTransactions: true,
    });

    if (!latestBlock.transactions) {
      return NextResponse.json({
        success: true,
        data: [],
        network,
        nextCursor: null,
        hasNextPage: false,
      });
    }

    // Get transactions from the latest block (up to limit)
    const transactions = latestBlock.transactions.slice(0, limit);

    // Fetch receipts in parallel to get actual status
    const formattedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        // Handle both full transaction objects and hashes
        if (typeof tx === "string") {
          const receipt = await client
            .getTransactionReceipt({ hash: tx as `0x${string}` })
            .catch(() => null);
          return {
            digest: tx,
            timestamp: String(Number(latestBlock.timestamp) * 1000),
            sender: "",
            status: receipt?.status === "success" ? ("success" as const) : ("failure" as const),
            type: "unknown",
            summary: "Transaction",
            gasUsed: receipt
              ? ((Number(receipt.gasUsed) * Number(receipt.effectiveGasPrice || 0)) / 1e18).toFixed(
                  6
                )
              : "0",
            checkpoint: String(latestBlock.number),
          };
        }

        // Get receipt for status
        const receipt = await client
          .getTransactionReceipt({ hash: tx.hash as `0x${string}` })
          .catch(() => null);

        const input = tx.input || "0x";
        const selector = input.slice(0, 10).toLowerCase();

        let type = "transfer";
        let summary = "BNB Transfer";

        if (input !== "0x" && input.length > 2) {
          // Common function selectors
          if (selector === "0xa9059cbb") {
            type = "transfer";
            summary = "Token Transfer";
          } else if (selector === "0x095ea7b3") {
            type = "contract";
            summary = "Token Approval";
          } else if (
            selector === "0x38ed1739" ||
            selector === "0x7ff36ab5" ||
            selector === "0x18cbafe5"
          ) {
            type = "swap";
            summary = "Token Swap";
          } else {
            type = "contract";
            summary = "Contract Call";
          }
        } else if (!tx.to) {
          type = "publish";
          summary = "Contract Deploy";
        }

        const gasUsed = receipt?.gasUsed || BigInt(0);
        const gasPrice = receipt?.effectiveGasPrice || tx.gasPrice || BigInt(0);
        const actualGas = Number(gasUsed * gasPrice) / 1e18;

        return {
          digest: tx.hash,
          timestamp: String(Number(latestBlock.timestamp) * 1000),
          sender: tx.from,
          status: receipt?.status === "success" ? ("success" as const) : ("failure" as const),
          type,
          summary,
          gasUsed: actualGas.toFixed(6),
          checkpoint: String(latestBlock.number),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      network,
      blockNumber: String(latestBlock.number),
      nextCursor: null,
      hasNextPage: false,
    });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: "NETWORK_ERROR",
          message: "Failed to fetch recent transactions",
        },
      },
      { status: 500 }
    );
  }
}
