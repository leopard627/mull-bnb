"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import type { Network } from "@/lib/types";
import { shortenAddress } from "@/lib/format-utils";

interface UserTransaction {
  digest: string;
  timestamp: string | null;
  sender: string;
  status: "success" | "failure";
  type: string;
  summary: string;
  gasUsed: string;
  checkpoint: string;
}

interface UserTransactionsProps {
  network: Network;
  onSelectTransaction: (digest: string) => void;
  externalAddress?: string; // Optional: show transactions for a specific address without wallet connection
  onBack?: () => void; // Optional: callback when user wants to go back
}

const typeConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  transfer: {
    icon: "↗",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  swap: {
    icon: "⇄",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  stake: {
    icon: "📈",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  nft: {
    icon: "🖼",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
  },
  contract: {
    icon: "⚡",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
  },
  publish: {
    icon: "📦",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/50",
  },
  other: {
    icon: "•",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
  unknown: {
    icon: "?",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
};

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return "-";
  const now = Date.now();
  const then = Number(timestamp);
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function UserTransactions({
  network,
  onSelectTransaction,
  externalAddress,
  onBack,
}: UserTransactionsProps) {
  const { address: walletAddress, isConnected } = useAccount();

  // Use external address if provided, otherwise use connected wallet address
  const address = externalAddress || walletAddress;
  const isExternalSearch = !!externalAddress;
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialLoadRef = useRef(false);
  const prevAddressRef = useRef<string | null>(null);

  const fetchTransactions = useCallback(
    async (cursor?: string) => {
      if (!address) return;

      if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const url = cursor
          ? `/api/transactions/address/${address}?network=${network}&limit=10&cursor=${cursor}`
          : `/api/transactions/address/${address}?network=${network}&limit=10`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          if (cursor) {
            setTransactions((prev) => [...prev, ...data.data]);
          } else {
            setTransactions(data.data);
          }
          setNextCursor(data.nextCursor);
          setHasMore(data.hasNextPage);
        } else {
          setError(data.error?.message || "Failed to fetch transactions");
        }
      } catch {
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [address, network]
  );

  // Reset and fetch when account or network changes
  useEffect(() => {
    if (address && address !== prevAddressRef.current) {
      prevAddressRef.current = address;
      initialLoadRef.current = false;
      setTransactions([]);
      setNextCursor(null);
      setHasMore(false);
    }
  }, [address]);

  useEffect(() => {
    if (address && !initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchTransactions();
    }
  }, [address, network, fetchTransactions]);

  // Reset on network change
  useEffect(() => {
    if (address) {
      initialLoadRef.current = false;
      setTransactions([]);
      setNextCursor(null);
      setHasMore(false);
    }
  }, [network, address]);

  const loadMore = () => {
    if (nextCursor && !isLoadingMore) {
      fetchTransactions(nextCursor);
    }
  };

  // Don't render if no address (either from wallet or external)
  if (!isExternalSearch && (!isConnected || !address)) {
    return null;
  }

  if (!address) {
    return null;
  }

  const renderTransactionRow = (tx: UserTransaction) => {
    const config = typeConfig[tx.type] || typeConfig.unknown;
    return (
      <tr
        key={tx.digest}
        onClick={() => onSelectTransaction(tx.digest)}
        className="group cursor-pointer transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded text-xs ${
                tx.status === "success"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
              }`}
            >
              {tx.status === "success" ? "✓" : "✗"}
            </span>
            <code className="font-mono text-sm text-amber-600 group-hover:underline dark:text-amber-400">
              {shortenAddress(tx.digest, 8)}
            </code>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
          >
            <span>{config.icon}</span>
            <span className="hidden lg:inline">{tx.summary || tx.type}</span>
          </span>
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          <span className="text-xs text-slate-600 dark:text-slate-400">{tx.gasUsed} BNB</span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatTimeAgo(tx.timestamp)}
          </span>
        </td>
      </tr>
    );
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-sm dark:border-amber-800 dark:bg-slate-800">
        <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-800/50 dark:from-amber-900/30 dark:to-orange-900/30">
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
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              My Transactions
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-white p-6 text-center shadow-sm dark:border-amber-800 dark:bg-slate-800">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => fetchTransactions()}
          className="rounded-lg bg-amber-500 px-4 py-2 text-white transition-colors hover:bg-amber-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-sm dark:border-amber-800 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-800/50 dark:from-amber-900/30 dark:to-orange-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExternalSearch && onBack && (
              <button
                onClick={onBack}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
                title="Back"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
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
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {isExternalSearch ? "Address Transactions" : "My Transactions"}
            </h3>
            <code className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              {shortenAddress(address, 6)}
            </code>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            )}
            <button
              onClick={() => {
                initialLoadRef.current = false;
                setTransactions([]);
                fetchTransactions();
              }}
              className="rounded-lg p-1.5 text-amber-400 transition-colors hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
              title="Refresh"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <svg
              className="h-6 w-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400">No transactions found</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Your transaction history will appear here
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-100 dark:border-amber-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Tx Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Type
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase md:table-cell dark:text-slate-400">
                    Gas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 dark:divide-amber-800/30">
                {transactions.map(renderTransactionRow)}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="border-t border-amber-100 bg-amber-50/30 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-900/10">
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span>Load More</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
