"use client";

import { useState, useEffect } from "react";
import type { Network } from "@/lib/types";
import { parseTransactionInput, isUrl } from "@/lib/url-parser";

interface TransactionInputProps {
  onSubmit: (digest: string, network: Network) => void;
  isLoading?: boolean;
  initialDigest?: string;
  network: Network;
  variant?: "hero" | "compact";
  onNetworkChange?: (network: Network) => void;
}

export function TransactionInput({
  onSubmit,
  isLoading,
  initialDigest = "",
  network,
  variant = "hero",
  onNetworkChange,
}: TransactionInputProps) {
  const [input, setInput] = useState(initialDigest);
  const [urlDetected, setUrlDetected] = useState<{ network: Network } | null>(null);

  // Sync input with initialDigest when it changes
  useEffect(() => {
    setInput(initialDigest);
    setUrlDetected(null);
  }, [initialDigest]);

  // Detect URL and show network hint
  useEffect(() => {
    if (isUrl(input)) {
      const parsed = parseTransactionInput(input, network);
      if (parsed && parsed.network !== network) {
        setUrlDetected({ network: parsed.network });
      } else {
        setUrlDetected(null);
      }
    } else {
      setUrlDetected(null);
    }
  }, [input, network]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Parse the input (could be URL or digest)
    const parsed = parseTransactionInput(trimmedInput, network);
    if (parsed) {
      // If URL detected a different network, switch to it
      if (parsed.network !== network && onNetworkChange) {
        onNetworkChange(parsed.network);
      }
      onSubmit(parsed.digest, parsed.network);
    } else {
      // Invalid input - still try to submit as-is (will show error from API)
      onSubmit(trimmedInput, network);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text.trim());
    } catch {
      // Clipboard access denied
    }
  };

  // Compact variant for header
  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="w-full flex-1 md:max-w-md">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tx hash, address, or BSCScan URL..."
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="absolute top-1/2 right-2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Paste
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-sky-500/20 transition-all hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none md:px-4"
          >
            {isLoading ? (
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
            ) : (
              "Go"
            )}
          </button>
        </div>
      </form>
    );
  }

  // Hero variant (default) for home screen
  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste tx hash, address, or BSCScan URL..."
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 pr-20 text-base text-slate-900 shadow-lg placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="absolute top-1/2 right-2 -translate-y-1/2 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Paste
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 text-base font-medium text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
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
                Loading
              </span>
            ) : (
              "Explain"
            )}
          </button>
        </div>
        {/* URL network detection hint */}
        {urlDetected && (
          <p className="text-center text-sm text-sky-600 dark:text-sky-400">
            URL detected - will switch to {urlDetected.network}
          </p>
        )}
      </div>
    </form>
  );
}
