"use client";

import type { GasInfo } from "@/lib/types";
import { shortenAddress } from "@/lib/format-utils";

interface GasInfoProps {
  gasInfo: GasInfo;
  sender: string;
}

export function GasInfoCard({ gasInfo, sender }: GasInfoProps) {
  const isSponsored = gasInfo.gasPayer !== sender;

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Clipboard access denied
    }
  };

  // Calculate percentages for visual bar
  const computationNum = parseFloat(gasInfo.computationCost) || 0;
  const storageNum = parseFloat(gasInfo.storageCost) || 0;
  const total = computationNum + storageNum;
  const computationPercent = total > 0 ? (computationNum / total) * 100 : 50;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <svg
              className="h-4 w-4 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gas Usage</h3>
          {isSponsored && (
            <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              Sponsored
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Total Gas */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {gasInfo.totalGas}
          </span>
          <span className="text-lg text-slate-500 dark:text-slate-400">BNB</span>
        </div>

        {/* Gas Breakdown Bar */}
        <div className="mb-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${computationPercent}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${100 - computationPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Computation
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Storage
            </span>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Computation</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {gasInfo.computationCost} BNB
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Storage</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {gasInfo.storageCost} BNB
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Storage Rebate</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              -{gasInfo.storageRebate} BNB
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 py-1.5 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Gas Price</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {gasInfo.gasPrice} Gwei
            </span>
          </div>
        </div>

        {/* Gas Payer */}
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isSponsored ? "Sponsored by" : "Paid by"}
            </span>
            <div className="flex items-center gap-1.5">
              <code className="font-mono text-xs text-slate-600 dark:text-slate-400">
                {shortenAddress(gasInfo.gasPayer, 8)}
              </code>
              <button
                onClick={() => copyAddress(gasInfo.gasPayer)}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                title="Copy address"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
