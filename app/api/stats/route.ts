import { NextResponse } from "next/server";
import { getBnbClient } from "@/lib/bnb-client";
import type { Network } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = (searchParams.get("network") || "mainnet") as Network;

  try {
    const client = getBnbClient(network);

    // Get latest block
    const latestBlock = await client.getBlock();
    const blockNumber = latestBlock.number;

    // Get gas price
    const gasPrice = await client.getGasPrice();

    // Get a few recent blocks to calculate TPS
    const blocks = await Promise.all([
      client.getBlock({ blockNumber: blockNumber }),
      client.getBlock({ blockNumber: blockNumber - BigInt(1) }),
      client.getBlock({ blockNumber: blockNumber - BigInt(2) }),
      client.getBlock({ blockNumber: blockNumber - BigInt(3) }),
      client.getBlock({ blockNumber: blockNumber - BigInt(4) }),
    ]);

    // Calculate average transactions per block
    const totalTxs = blocks.reduce((sum, b) => sum + b.transactions.length, 0);
    const avgTxsPerBlock = totalTxs / blocks.length;

    // BNB block time is ~3 seconds
    const avgTps = Math.round(avgTxsPerBlock / 3);

    // Calculate average gas price in Gwei
    const gasPriceGwei = Number(gasPrice) / 1e9;

    return NextResponse.json({
      success: true,
      data: {
        latestBlock: blockNumber?.toString(),
        totalTransactions: totalTxs,
        avgGasPrice: gasPriceGwei.toFixed(1),
        avgTps,
        blockTime: 3,
        timestamp: Number(latestBlock.timestamp) * 1000,
      },
      network,
    });
  } catch (error) {
    console.error("Error fetching network stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: "NETWORK_ERROR",
          message: "Failed to fetch network statistics",
        },
      },
      { status: 500 }
    );
  }
}
