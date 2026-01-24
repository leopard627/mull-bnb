"use client";

import { useState, useEffect } from "react";
import type { Network } from "@/lib/types";
import {
  getSearchHistory,
  removeFromHistory,
  clearSearchHistory,
  formatRelativeTime,
  type SearchHistoryItem,
} from "@/lib/search-history";
import { shortenAddress } from "@/lib/format-utils";

interface SearchHistoryProps {
  onSelect: (digest: string, network: Network) => void;
  currentNetwork: Network;
}

export function SearchHistory({ onSelect, currentNetwork: _currentNetwork }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Refresh history when component becomes visible
  useEffect(() => {
    if (isOpen) {
      setHistory(getSearchHistory());
    }
  }, [isOpen]);

  const handleRemove = (e: React.MouseEvent, digest: string, network: string) => {
    e.stopPropagation();
    removeFromHistory(digest, network);
    setHistory(getSearchHistory());
  };

  const handleClear = () => {
    clearSearchHistory();
    setHistory([]);
    setIsOpen(false);
  };

  if (history.length === 0) {
    return null;
  }

  // Filter by current network or show all
  const filteredHistory = history;

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="hidden sm:inline">Recent searches</span>
        <span className="sm:hidden">History</span>
        <span>({history.length})</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="animate-fade-in absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 md:px-4 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recent Searches
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear all
            </button>
          </div>

          {/* History List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredHistory.map((item) => (
              <button
                key={`${item.digest}-${item.network}`}
                onClick={() => {
                  onSelect(item.digest, item.network);
                  setIsOpen(false);
                }}
                className="group flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 md:gap-3 md:px-4 md:py-3 dark:hover:bg-slate-700/50"
              >
                {/* Network Badge */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium md:h-auto md:w-auto md:px-2 md:py-0.5 ${
                    item.network === "mainnet"
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  }`}
                >
                  {item.network === "mainnet" ? "M" : "T"}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  {/* Mobile: Compact */}
                  <div className="md:hidden">
                    <div className="flex items-center gap-2">
                      <code className="truncate font-mono text-sm text-slate-700 dark:text-slate-300">
                        {shortenAddress(item.digest, 6)}
                      </code>
                      {item.type && (
                        <span className="truncate text-xs text-slate-400 capitalize dark:text-slate-500">
                          {item.type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Full */}
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <code className="truncate font-mono text-sm text-slate-700 dark:text-slate-300">
                        {shortenAddress(item.digest, 8)}
                      </code>
                      {item.type && (
                        <span className="text-xs text-slate-500 capitalize dark:text-slate-400">
                          {item.type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    {item.summary && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time & Remove */}
                <div className="flex shrink-0 items-center gap-1 md:gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                  {/* Mobile: Always visible remove button */}
                  <button
                    onClick={(e) => handleRemove(e, item.digest, item.network)}
                    className="p-1 text-slate-400 transition-opacity hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 dark:hover:text-red-400"
                    title="Remove"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
