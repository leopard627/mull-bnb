"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Network } from "@/lib/types";
import { shortenAddress } from "@/lib/format-utils";

interface RecentTransaction {
  digest: string;
  timestamp: string | null;
  sender: string;
  status: "success" | "failure";
  type: string;
  summary: string;
  gasUsed: string;
  checkpoint: string;
}

interface RecentTransactionsProps {
  network: Network;
  onSelectTransaction: (digest: string) => void;
}

interface PageData {
  transactions: RecentTransaction[];
  nextCursor: string | null;
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
  split: {
    icon: "⊖",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-700",
  },
  merge: {
    icon: "⊕",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-700",
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
  system: {
    icon: "⚙",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-700",
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

const PAGE_SIZE = 20;
const MAX_VISIBLE_PAGES = 5;

export function RecentTransactions({ network, onSelectTransaction }: RecentTransactionsProps) {
  // Page data cache: stores transactions and next cursor for each page
  const [pageCache, setPageCache] = useState<Map<number, PageData>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // For mobile: accumulated transactions
  const [mobileTransactions, setMobileTransactions] = useState<RecentTransaction[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileNextCursor, setMobileNextCursor] = useState<string | null>(null);
  const [mobileHasMore, setMobileHasMore] = useState(false);

  // Track highest page we know exists
  const [maxKnownPage, setMaxKnownPage] = useState(1);

  const fetchPage = useCallback(
    async (page: number, cursor?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const url = cursor
          ? `/api/transactions/recent?network=${network}&limit=${PAGE_SIZE}&cursor=${cursor}`
          : `/api/transactions/recent?network=${network}&limit=${PAGE_SIZE}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          const pageData: PageData = {
            transactions: data.data,
            nextCursor: data.nextCursor,
          };

          setPageCache((prev) => {
            const newCache = new Map(prev);
            newCache.set(page, pageData);
            return newCache;
          });

          setHasNextPage(data.hasNextPage);
          if (data.hasNextPage && page >= maxKnownPage) {
            setMaxKnownPage(page + 1);
          }

          // Also update mobile state for first page
          if (page === 1) {
            setMobileTransactions(data.data);
            setMobileNextCursor(data.nextCursor);
            setMobileHasMore(data.hasNextPage);
          }
        } else {
          setError(data.error?.message || "Failed to fetch transactions");
        }
      } catch {
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    },
    [network, maxKnownPage]
  );

  // Mobile: Load more function
  const loadMore = useCallback(async () => {
    if (!mobileNextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const url = `/api/transactions/recent?network=${network}&limit=${PAGE_SIZE}&cursor=${mobileNextCursor}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setMobileTransactions((prev) => [...prev, ...data.data]);
        setMobileNextCursor(data.nextCursor);
        setMobileHasMore(data.hasNextPage);
      }
    } catch {
      // Silently fail for load more
    } finally {
      setIsLoadingMore(false);
    }
  }, [network, mobileNextCursor, isLoadingMore]);

  // Go to specific page (PC)
  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1) return;

      setCurrentPage(page);

      // Check if we have this page cached
      const cachedPage = pageCache.get(page);
      if (cachedPage) {
        setHasNextPage(!!cachedPage.nextCursor);
        return;
      }

      // Need to fetch this page - get cursor from previous page
      const prevPage = pageCache.get(page - 1);
      if (prevPage?.nextCursor) {
        await fetchPage(page, prevPage.nextCursor);
      } else if (page === 1) {
        await fetchPage(1);
      }
    },
    [pageCache, fetchPage]
  );

  // Initial load and network change
  const initialLoadRef = useRef(false);
  useEffect(() => {
    // Reset everything on network change
    setPageCache(new Map());
    setCurrentPage(1);
    setMaxKnownPage(1);
    setMobileTransactions([]);
    setMobileNextCursor(null);
    setMobileHasMore(false);
    initialLoadRef.current = false;
  }, [network]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchPage(1);
    }

    // Auto-refresh first page every 10 seconds
    const interval = setInterval(() => {
      if (currentPage === 1) {
        fetchPage(1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchPage, currentPage]);

  // Get current page transactions
  const currentTransactions = pageCache.get(currentPage)?.transactions || [];
  const displayTransactions = currentTransactions;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const totalPages = hasNextPage ? maxKnownPage + 1 : maxKnownPage;

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= maxKnownPage; i++) {
        pages.push(i);
      }
      if (hasNextPage) pages.push(maxKnownPage + 1);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(maxKnownPage, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < maxKnownPage - 2) {
        pages.push("ellipsis");
      }

      // Show last known page
      if (!pages.includes(maxKnownPage)) {
        pages.push(maxKnownPage);
      }

      // Show next if available
      if (hasNextPage && !pages.includes(maxKnownPage + 1)) {
        pages.push(maxKnownPage + 1);
      }
    }

    return pages;
  };

  if (isLoading && displayTransactions.length === 0 && mobileTransactions.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
              <svg
                className="h-4 w-4 text-sky-600 dark:text-sky-400"
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
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recent Transactions
            </h3>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => fetchPage(1)}
          className="rounded-lg bg-sky-500 px-4 py-2 text-white transition-colors hover:bg-sky-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render transaction row
  const renderTransactionRow = (tx: RecentTransaction) => {
    const config = typeConfig[tx.type] || typeConfig.unknown;
    return (
      <tr
        key={tx.digest}
        onClick={() => onSelectTransaction(tx.digest)}
        className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
            <code className="font-mono text-sm text-sky-600 group-hover:underline dark:text-sky-400">
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
        <td className="hidden px-4 py-3 sm:table-cell">
          <code className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {shortenAddress(tx.sender, 6)}
          </code>
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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
              <svg
                className="h-4 w-4 text-sky-600 dark:text-sky-400"
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
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recent Transactions
            </h3>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-600 capitalize dark:bg-sky-900/50 dark:text-sky-400">
              {network}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            )}
            <button
              onClick={() => fetchPage(1)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
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

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Tx Hash
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Sender
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Gas
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {displayTransactions.map(renderTransactionRow)}
          </tbody>
        </table>
      </div>

      {/* Mobile Table */}
      <div className="overflow-x-auto md:hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Tx Hash
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {mobileTransactions.map(renderTransactionRow)}
          </tbody>
        </table>
      </div>

      {/* Desktop: Number Pagination */}
      <div className="hidden border-t border-slate-100 bg-slate-50/30 px-4 py-3 md:block dark:border-slate-700/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {currentPage} • Click any transaction to see details
          </p>

          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, idx) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  disabled={isLoading}
                  className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-sky-500 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  } disabled:opacity-50`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage && currentPage >= maxKnownPage}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Load More */}
      <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-3 md:hidden dark:border-slate-700/50 dark:bg-slate-800/30">
        <div className="flex flex-col items-center gap-3">
          {mobileHasMore && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sky-400 dark:hover:bg-sky-900/30 dark:hover:text-sky-300"
            >
              {isLoadingMore ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          )}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {mobileTransactions.length} transactions • Click any to see details
          </p>
        </div>
      </div>
    </div>
  );
}
