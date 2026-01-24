import { NextResponse } from "next/server";
import { isValidAddress } from "@/lib/bnb-client";
import type { Network } from "@/lib/types";

// Note: For full address transaction history on BNB Chain,
// you would need to integrate with BSCScan API or a blockchain indexer.
// This is a placeholder implementation.

const BSCSCAN_API_URL = {
  mainnet: "https://api.bscscan.com/api",
  testnet: "https://api-testnet.bscscan.com/api",
};

export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const { searchParams } = new URL(request.url);
  const network = (searchParams.get("network") || "mainnet") as Network;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const page = parseInt(searchParams.get("page") || "1");

  // Validate address format
  if (!isValidAddress(address)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: "INVALID_ADDRESS",
          message: "Invalid BNB Chain address format",
        },
      },
      { status: 400 }
    );
  }

  try {
    // Use BSCScan API to get transaction history
    const apiKey = process.env.BSCSCAN_API_KEY || "";
    const apiUrl = BSCSCAN_API_URL[network];

    const response = await fetch(
      `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${limit}&sort=desc&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== "1" || !data.result) {
      // No transactions found or error
      return NextResponse.json({
        success: true,
        data: [],
        address,
        network,
        nextCursor: null,
        hasNextPage: false,
      });
    }

    const transactions = data.result;

    interface BscTransaction {
      hash: string;
      timeStamp: string;
      from: string;
      to: string;
      value: string;
      gas: string;
      gasUsed: string;
      gasPrice: string;
      isError: string;
      input: string;
      functionName?: string;
      methodId?: string;
    }

    const formattedTransactions = transactions.map((tx: BscTransaction) => {
      const gasUsed = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
      const gasInBnb = Number(gasUsed) / 1e18;

      // Determine transaction type from input data
      let type = "transfer";
      let summary = "BNB Transfer";

      if (tx.input && tx.input !== "0x") {
        const selector = tx.input.slice(0, 10).toLowerCase();

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
          summary = tx.functionName || "Contract Call";
        }
      }

      return {
        digest: tx.hash,
        timestamp: String(Number(tx.timeStamp) * 1000),
        sender: tx.from,
        status: tx.isError === "0" ? "success" : "failure",
        type,
        summary,
        gasUsed: gasInBnb.toFixed(6),
        checkpoint: "", // Not applicable for EVM
      };
    });

    const hasNextPage = transactions.length === limit;

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      address,
      network,
      nextCursor: hasNextPage ? String(page + 1) : null,
      hasNextPage,
    });
  } catch (error) {
    console.error("Error fetching address transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: "NETWORK_ERROR",
          message: "Failed to fetch transactions for address",
        },
      },
      { status: 500 }
    );
  }
}
