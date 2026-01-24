import { type NextRequest, NextResponse } from "next/server";
import { getTokenInfo } from "@/lib/token-images";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinType: string }> }
) {
  const { coinType } = await params;

  if (!coinType) {
    return NextResponse.json({ error: "coinType is required" }, { status: 400 });
  }

  // Decode the coinType (it's URL encoded - could be a contract address)
  const decodedCoinType = decodeURIComponent(coinType).toLowerCase();

  // Check local registry (fast)
  const localInfo = getTokenInfo(decodedCoinType);
  if (localInfo) {
    return NextResponse.json({
      coinType: decodedCoinType,
      symbol: localInfo.symbol,
      name: localInfo.name,
      decimals: localInfo.decimals,
      imgUrl: localInfo.image,
      source: "local",
    });
  }

  // For BNB Chain, we could add CoinGecko or other API fallback here
  // For now, return unknown
  return NextResponse.json({
    coinType: decodedCoinType,
    symbol: null,
    name: null,
    decimals: null,
    imgUrl: null,
    source: "unknown",
  });
}
