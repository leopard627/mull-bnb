"use client";

import { useState } from "react";
import type { ExplanationResult, TransactionType, Network } from "@/lib/types";
import { shortenAddress } from "@/lib/format-utils";

interface TransactionSummaryProps {
  explanation: ExplanationResult;
  status: "success" | "failure";
  error?: string;
  timestamp: string | null;
  digest: string;
  network: Network;
}

const typeConfig: Record<
  TransactionType,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  transfer: {
    label: "Transfer",
    icon: "↗",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  approval: {
    label: "Approval",
    icon: "✓",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
  },
  nft_transfer: {
    label: "NFT Transfer",
    icon: "🖼",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
  },
  nft_mint: {
    label: "NFT Mint",
    icon: "✨",
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-pink-100 dark:bg-pink-900/50",
  },
  nft_burn: {
    label: "NFT Burn",
    icon: "🔥",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
  },
  nft_list: {
    label: "NFT Listing",
    icon: "🏷",
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  nft_purchase: {
    label: "NFT Purchase",
    icon: "🛒",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  nft_cancel_listing: {
    label: "Cancel Listing",
    icon: "✖",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  nft_make_offer: {
    label: "Make Offer",
    icon: "💰",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
  },
  nft_accept_offer: {
    label: "Accept Offer",
    icon: "✅",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  swap: {
    label: "Swap",
    icon: "⇄",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  liquidity_add: {
    label: "Add Liquidity",
    icon: "💧",
    color: "text-cyan-700 dark:text-cyan-300",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  liquidity_remove: {
    label: "Remove Liquidity",
    icon: "💨",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
  },
  mint: {
    label: "Create",
    icon: "+",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
  },
  burn: {
    label: "Burn",
    icon: "−",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/50",
  },
  merge_coins: {
    label: "Merge Coins",
    icon: "⊕",
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
  split_coins: {
    label: "Split Coins",
    icon: "⊖",
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
  stake: {
    label: "Stake",
    icon: "📈",
    color: "text-cyan-700 dark:text-cyan-300",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  unstake: {
    label: "Unstake",
    icon: "📉",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
  },
  claim_rewards: {
    label: "Claim Rewards",
    icon: "🎁",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
  },
  // DeFi Lending
  borrow: {
    label: "Borrow",
    icon: "🏦",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/50",
  },
  repay: {
    label: "Repay",
    icon: "💳",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  supply: {
    label: "Supply",
    icon: "📥",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  withdraw: {
    label: "Withdraw",
    icon: "📤",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
  },
  liquidate: {
    label: "Liquidate",
    icon: "⚠️",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/50",
  },
  // Perpetuals
  open_position: {
    label: "Open Position",
    icon: "📊",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  close_position: {
    label: "Close Position",
    icon: "📉",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/50",
  },
  perp_trade: {
    label: "Perp Trade",
    icon: "📊",
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  // Flash Loan Arbitrage
  flash_loan_arbitrage: {
    label: "Flash Loan Arbitrage",
    icon: "⚡",
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
  },
  // Bridge
  bridge: {
    label: "Bridge",
    icon: "🌉",
    color: "text-teal-700 dark:text-teal-300",
    bgColor: "bg-teal-100 dark:bg-teal-900/50",
  },
  bridge_in: {
    label: "Bridge In",
    icon: "🌉",
    color: "text-teal-700 dark:text-teal-300",
    bgColor: "bg-teal-100 dark:bg-teal-900/50",
  },
  bridge_out: {
    label: "Bridge Out",
    icon: "🌉",
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  // Name Service (BNS/SpaceID)
  register_name: {
    label: "Register Name",
    icon: "🏷️",
    color: "text-sky-700 dark:text-sky-300",
    bgColor: "bg-sky-100 dark:bg-sky-900/50",
  },
  renew_name: {
    label: "Renew Name",
    icon: "🔄",
    color: "text-sky-700 dark:text-sky-300",
    bgColor: "bg-sky-100 dark:bg-sky-900/50",
  },
  // Governance
  vote: {
    label: "Vote",
    icon: "🗳️",
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
  },
  propose: {
    label: "Propose",
    icon: "📜",
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
  },
  publish: {
    label: "Deploy",
    icon: "📦",
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-pink-100 dark:bg-pink-900/50",
  },
  upgrade: {
    label: "Upgrade",
    icon: "⬆",
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
  },
  airdrop_claim: {
    label: "Airdrop",
    icon: "🪂",
    color: "text-teal-700 dark:text-teal-300",
    bgColor: "bg-teal-100 dark:bg-teal-900/50",
  },
  multisig: {
    label: "Multisig",
    icon: "👥",
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
  sponsored: {
    label: "Sponsored",
    icon: "🎫",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
  },
  // System Transactions
  system_consensus: {
    label: "System: Consensus",
    icon: "⚙️",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  system_epoch_change: {
    label: "System: Epoch",
    icon: "🔄",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  system_genesis: {
    label: "System: Genesis",
    icon: "🌟",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
  },
  system_checkpoint: {
    label: "System: Checkpoint",
    icon: "📍",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  system_authenticator: {
    label: "System: Auth",
    icon: "🔐",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  system_randomness: {
    label: "System: Randomness",
    icon: "🎲",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  generic: {
    label: "Contract Call",
    icon: "⚡",
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
};

export function TransactionSummary({
  explanation,
  status,
  error,
  timestamp,
  digest,
  network,
}: TransactionSummaryProps) {
  const [copyFeedback, setCopyFeedback] = useState<"digest" | "share" | null>(null);

  const config = typeConfig[explanation.type] || typeConfig.generic;
  const explorerUrl =
    network === "mainnet"
      ? `https://bscscan.com/tx/${digest}`
      : `https://testnet.bscscan.com/tx/${digest}`;

  const copyDigest = async () => {
    try {
      await navigator.clipboard.writeText(digest);
      setCopyFeedback("digest");
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      // Clipboard access denied
    }
  };

  const shareUrl = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://mull.vercel.app/?tx=${digest}&network=${network}`;

    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `BNB Transaction - ${shortenAddress(digest, 8)}`,
          text: explanation.summary,
          url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setCopyFeedback("share");
        setTimeout(() => setCopyFeedback(null), 2000);
      }
    } catch {
      // Share cancelled or clipboard denied
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${config.bgColor} ${config.color}`}
            >
              <span>{config.icon}</span>
              {config.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                status === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
              }`}
            >
              {status === "success" ? "✓ Success" : "✗ Failed"}
            </span>
            {explanation.isSponsored && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                🎫 Sponsored
              </span>
            )}
          </div>
          {timestamp && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(Number(timestamp)).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary */}
        <h2 className="mb-4 text-xl leading-relaxed font-semibold text-slate-900 dark:text-slate-100">
          {explanation.summary}
        </h2>

        {/* Error message */}
        {status === "failure" && error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="mb-4 space-y-2">
          {explanation.details.map((detail, index) => (
            <p key={index} className="text-sm text-slate-600 dark:text-slate-400">
              {detail}
            </p>
          ))}
        </div>

        {/* Digest and links */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-700/50">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">Digest:</span>
            <code className="truncate font-mono text-xs text-slate-700 dark:text-slate-300">
              {shortenAddress(digest, 12)}
            </code>
            <button
              onClick={copyDigest}
              className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Copy digest"
            >
              {copyFeedback === "digest" ? (
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              onClick={shareUrl}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-300"
              title="Share this transaction"
            >
              {copyFeedback === "share" ? (
                <>
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </>
              )}
            </button>
            {/* BSCScan Link */}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
            >
              BSCScan
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
