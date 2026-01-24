"use client";

import Image from "next/image";
import type { BalanceChangeInfo } from "@/lib/types";
import { shortenAddress } from "@/lib/format-utils";
import { getTokenImage } from "@/lib/token-images";

interface BalanceChangesProps {
  changes: BalanceChangeInfo[];
}

const DEFAULT_TOKEN_IMAGE = "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png";

export function BalanceChanges({ changes }: BalanceChangesProps) {
  if (changes.length === 0) return null;

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Clipboard access denied
    }
  };

  // Get token image - first from local registry, then default
  const getTokenImageUrl = (coinType: string): string => {
    const image = getTokenImage(coinType);
    return image || DEFAULT_TOKEN_IMAGE;
  };

  // Group changes by owner
  const groupedChanges = changes.reduce(
    (acc, change) => {
      if (!acc[change.owner]) acc[change.owner] = [];
      acc[change.owner].push(change);
      return acc;
    },
    {} as Record<string, BalanceChangeInfo[]>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <svg
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Balance Changes
          </h3>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            {changes.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {Object.entries(groupedChanges).map(([owner, ownerChanges]) => (
          <div key={owner} className="space-y-2">
            {/* Owner Address */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <span className="text-xs font-bold text-white">
                  {owner.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <code className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {shortenAddress(owner, 8)}
              </code>
              <button
                onClick={() => copyAddress(owner)}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                title="Copy address"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Changes for this owner */}
            <div className="space-y-1.5 pl-8">
              {ownerChanges.map((change, index) => {
                const isPositive = change.isPositive;
                const displayAmount = isPositive ? `+${change.amount}` : change.amount;
                const tokenImage = getTokenImageUrl(change.coinType);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg p-2.5 transition-colors ${
                      isPositive
                        ? "border border-green-100 bg-green-50 dark:border-green-800/30 dark:bg-green-900/20"
                        : "border border-red-100 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-5 w-5">
                        <Image
                          src={tokenImage}
                          alt={change.coinName}
                          width={20}
                          height={20}
                          className="rounded-full"
                          unoptimized
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {change.coinName}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {displayAmount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
