"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Network, ParsedTransaction, TransactionError } from "@/lib/types";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TransactionInput } from "./TransactionInput";
import { TransactionSummary } from "./TransactionSummary";
import { TransactionFlow } from "./TransactionFlow";
import { GasInfoCard } from "./GasInfo";
import { ObjectChanges } from "./ObjectChanges";
import { BalanceChanges } from "./BalanceChanges";
import { MoveCallDetails } from "./MoveCallDetails";
import { ErrorDisplay } from "./ErrorDisplay";
import { NetworkStats } from "./NetworkStats";
import { RecentTransactions } from "./RecentTransactions";
import { UserTransactions } from "./UserTransactions";
import { SearchHistory } from "./SearchHistory";
import { saveToHistory, updateHistoryItem } from "@/lib/search-history";
import { parseInput, type InputType } from "@/lib/url-parser";

interface ApiResponse {
  success?: boolean;
  data?: ParsedTransaction;
  error?: TransactionError;
  network?: Network;
}

export function TransactionExplainer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState<TransactionError | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<Network>(
    (searchParams.get("network") as Network) || "mainnet"
  );
  const [lastDigest, setLastDigest] = useState<string>(searchParams.get("tx") || "");
  const [searchedAddress, setSearchedAddress] = useState<string | null>(
    searchParams.get("address") || null
  );

  // Determine if we should show the detail view (has transaction, error, is loading, or searching address)
  const showDetailView = transaction || error || isLoading || searchedAddress;

  // Initial load: fetch transaction or address from URL if present
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const txFromUrl = searchParams.get("tx");
    const addressFromUrl = searchParams.get("address");
    const networkFromUrl = (searchParams.get("network") as Network) || "mainnet";

    if (txFromUrl) {
      setCurrentNetwork(networkFromUrl);
      fetchTransactionInternal(txFromUrl, networkFromUrl);
    } else if (addressFromUrl) {
      setCurrentNetwork(networkFromUrl);
      setSearchedAddress(addressFromUrl);
    }
  }, []);

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    if (!initialLoadDone.current) return; // Skip during initial load

    const txFromUrl = searchParams.get("tx");
    const networkFromUrl = (searchParams.get("network") as Network) || "mainnet";

    if (txFromUrl && txFromUrl !== lastDigest) {
      // URL has a different transaction, fetch it
      setLastDigest(txFromUrl);
      setCurrentNetwork(networkFromUrl);
      fetchTransactionInternal(txFromUrl, networkFromUrl);
    } else if (!txFromUrl && (transaction || error)) {
      // URL doesn't have a transaction but we have one displayed - reset
      setTransaction(null);
      setError(null);
      setLastDigest("");
    }
  }, [searchParams]);

  const fetchTransactionInternal = async (digest: string, network: Network) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/transaction/${encodeURIComponent(digest)}?network=${network}`
      );
      const data: ApiResponse = await response.json();

      if (data.error) {
        setError(data.error);
        setTransaction(null);
      } else if (data.data) {
        setTransaction(data.data);
        setError(null);
      }
    } catch {
      setError({
        type: "NETWORK_ERROR",
        message: "Failed to connect to the server. Please try again.",
      });
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransaction = useCallback(
    async (input: string, network: Network) => {
      // Parse input to determine if it's a transaction or address
      const parsed = parseInput(input, network);

      if (parsed?.type === "address") {
        // Handle address search
        setSearchedAddress(parsed.value);
        setLastDigest("");
        setTransaction(null);
        setError(null);
        setCurrentNetwork(parsed.network);

        // Update URL with the address
        const params = new URLSearchParams();
        params.set("address", parsed.value);
        params.set("network", parsed.network);
        router.push(`?${params.toString()}`);
        return;
      }

      // Handle transaction
      const digest = parsed?.value || input;
      setSearchedAddress(null);
      setLastDigest(digest);
      setCurrentNetwork(network);

      // Save to search history
      saveToHistory({ digest, network });

      // Update URL with the transaction
      const params = new URLSearchParams();
      params.set("tx", digest);
      params.set("network", network);
      router.push(`?${params.toString()}`);

      await fetchTransactionInternal(digest, network);
    },
    [router]
  );

  // Update history item when transaction is successfully loaded
  useEffect(() => {
    if (transaction && lastDigest) {
      updateHistoryItem(lastDigest, currentNetwork, {
        type: transaction.explanation.type,
        summary: transaction.explanation.summary.slice(0, 100),
      });
    }
  }, [transaction, lastDigest, currentNetwork]);

  const handleReset = () => {
    setTransaction(null);
    setError(null);
    setLastDigest("");
    setSearchedAddress(null);
    // Clear URL params
    router.push("/");
  };

  const handleRetry = () => {
    if (lastDigest) {
      fetchTransactionInternal(lastDigest, currentNetwork);
    }
  };

  const handleNetworkNavigation = (network: Network) => {
    router.push(`/?network=${network}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        showDetailView={!!showDetailView}
        currentNetwork={currentNetwork}
        setCurrentNetwork={setCurrentNetwork}
        onReset={handleReset}
        onSubmit={fetchTransaction}
        isLoading={isLoading}
        lastDigest={lastDigest}
        transaction={transaction}
        onNetworkNavigation={handleNetworkNavigation}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8">
        {/* Home View - Hero Search */}
        {!showDetailView && (
          <div className="animate-fade-in mx-auto max-w-6xl space-y-8">
            {/* Hero Section */}
            <div className="pt-12 pb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl dark:text-slate-100">
                Understand any BNB transaction
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600 dark:text-slate-400">
                Paste a transaction digest to get a clear, human-readable explanation
              </p>

              {/* Hero Search Input */}
              <TransactionInput
                onSubmit={fetchTransaction}
                isLoading={isLoading}
                initialDigest={lastDigest}
                network={currentNetwork}
                variant="hero"
                onNetworkChange={setCurrentNetwork}
              />

              {/* Search History */}
              <div className="mt-4">
                <SearchHistory onSelect={fetchTransaction} currentNetwork={currentNetwork} />
              </div>
            </div>

            {/* Network Stats */}
            <NetworkStats network={currentNetwork} />

            {/* User's Transactions (when wallet connected) */}
            <UserTransactions
              network={currentNetwork}
              onSelectTransaction={(digest) => fetchTransaction(digest, currentNetwork)}
            />

            {/* Recent Transactions */}
            <RecentTransactions
              network={currentNetwork}
              onSelectTransaction={(digest) => fetchTransaction(digest, currentNetwork)}
            />

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="hover-lift rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                  Plain Language
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complex transactions explained in simple, human-readable summaries
                </p>
              </div>

              <div className="hover-lift rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                  Visual Flow
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive diagrams showing token and NFT movements
                </p>
              </div>

              <div className="hover-lift rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                  Complete Details
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gas fees, object changes, balance impacts all in one place
                </p>
              </div>
            </div>

            {/* Supported Transaction Types */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Supported Transaction Types
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    icon: "↗",
                    label: "Transfers",
                    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
                  },
                  {
                    icon: "⇄",
                    label: "Swaps",
                    color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                  },
                  {
                    icon: "📈",
                    label: "Staking",
                    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400",
                  },
                  {
                    icon: "🖼",
                    label: "NFTs",
                    color:
                      "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
                  },
                  {
                    icon: "💧",
                    label: "Liquidity",
                    color: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400",
                  },
                  {
                    icon: "📦",
                    label: "Deploys",
                    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400",
                  },
                  {
                    icon: "🎫",
                    label: "Sponsored",
                    color:
                      "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400",
                  },
                  {
                    icon: "⚡",
                    label: "Contracts",
                    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${item.color}`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State - Skeleton */}
        {isLoading && (
          <div className="animate-fade-in mx-auto mt-8 max-w-4xl space-y-6">
            {/* Summary Skeleton */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="p-6">
                {/* Type badge + Status */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="skeleton h-6 w-24 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
                {/* Title */}
                <div className="skeleton mb-3 h-8 w-3/4 rounded-lg" />
                {/* Summary text */}
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </div>
                {/* Meta info */}
                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                  <div className="skeleton h-5 w-32 rounded" />
                  <div className="skeleton h-5 w-40 rounded" />
                  <div className="skeleton h-5 w-28 rounded" />
                </div>
              </div>
            </div>

            {/* Flow Visualization Skeleton */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="skeleton h-5 w-32 rounded" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center gap-4 md:gap-8">
                  {/* From node */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="skeleton h-16 w-16 rounded-xl md:h-20 md:w-20" />
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                  {/* Arrow */}
                  <div className="max-w-32 flex-1">
                    <div className="skeleton h-1 w-full rounded" />
                  </div>
                  {/* To node */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="skeleton h-16 w-16 rounded-xl md:h-20 md:w-20" />
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid Skeleton */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Gas Info Skeleton */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="skeleton h-5 w-24 rounded" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton h-4 w-16 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-4 w-24 rounded" />
                  </div>
                  <div className="border-t border-slate-100 pt-2 dark:border-slate-700">
                    <div className="skeleton h-4 w-32 rounded" />
                  </div>
                </div>
              </div>

              {/* Balance Changes Skeleton */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="skeleton h-5 w-32 rounded" />
                </div>
                <div className="space-y-3 p-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <div className="skeleton mb-1 h-4 w-24 rounded" />
                        <div className="skeleton h-3 w-16 rounded" />
                      </div>
                      <div className="skeleton h-5 w-20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Object Changes Skeleton */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="skeleton h-5 w-28 rounded" />
              </div>
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/30"
                  >
                    <div className="skeleton h-8 w-8 rounded" />
                    <div className="flex-1">
                      <div className="skeleton mb-1 h-4 w-48 rounded" />
                      <div className="skeleton h-3 w-32 rounded" />
                    </div>
                    <div className="skeleton h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Loading indicator at bottom */}
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm">
                Analyzing transaction from BNB Chain {currentNetwork}...
              </span>
            </div>
          </div>
        )}

        {/* Address Search Results */}
        {searchedAddress && !isLoading && (
          <div className="animate-fade-in mx-auto mt-8 max-w-4xl">
            <UserTransactions
              network={currentNetwork}
              onSelectTransaction={(digest) => fetchTransaction(digest, currentNetwork)}
              externalAddress={searchedAddress}
              onBack={handleReset}
            />
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && !searchedAddress && (
          <div className="animate-fade-in mt-8">
            <ErrorDisplay error={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Transaction Results */}
        {transaction && !isLoading && (
          <div className="animate-fade-in mx-auto mt-8 max-w-4xl space-y-6">
            {/* Summary */}
            <TransactionSummary
              explanation={transaction.explanation}
              status={transaction.status}
              error={transaction.error}
              timestamp={transaction.timestamp}
              digest={transaction.digest}
              network={currentNetwork}
            />

            {/* Flow Visualization */}
            <TransactionFlow actions={transaction.explanation.actions} />

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Gas Info */}
              <GasInfoCard gasInfo={transaction.gasInfo} sender={transaction.sender} />

              {/* Balance Changes */}
              {transaction.balanceChanges.length > 0 && (
                <BalanceChanges changes={transaction.balanceChanges} />
              )}
            </div>

            {/* Object Changes */}
            {transaction.objectChanges.length > 0 && (
              <ObjectChanges changes={transaction.objectChanges} network={currentNetwork} />
            )}

            {/* Move Calls */}
            {transaction.moveCalls.length > 0 && (
              <MoveCallDetails calls={transaction.moveCalls} network={currentNetwork} />
            )}

            {/* Explain Another Button */}
            <div className="pt-4 text-center">
              <button
                onClick={handleReset}
                className="rounded-xl border border-sky-200 px-6 py-3 text-base font-medium text-sky-600 transition-colors hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/30"
              >
                Explain Another Transaction
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
