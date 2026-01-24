"use client";

import type { TransactionError } from "@/lib/types";

interface ErrorDisplayProps {
  error: TransactionError;
  onRetry?: () => void;
}

const errorMessages: Record<
  TransactionError["type"],
  { title: string; suggestion: string; icon: string }
> = {
  INVALID_DIGEST: {
    title: "Invalid Transaction Hash",
    suggestion:
      "Please check the hash format. It should be a 66-character hex string starting with 0x.",
    icon: "!",
  },
  NOT_FOUND: {
    title: "Transaction Not Found",
    suggestion:
      "The transaction may not exist on this network. Try switching between Mainnet and Testnet.",
    icon: "?",
  },
  NETWORK_ERROR: {
    title: "Network Error",
    suggestion:
      "Unable to connect to BNB Chain. Please check your internet connection and try again.",
    icon: "~",
  },
  RATE_LIMITED: {
    title: "Too Many Requests",
    suggestion: "You've made too many requests. Please wait a moment before trying again.",
    icon: "#",
  },
  PARSE_ERROR: {
    title: "Parse Error",
    suggestion: "Unable to parse the transaction data. This might be an unusual transaction type.",
    icon: "x",
  },
};

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const { title, suggestion, icon } = errorMessages[error.type] || {
    title: "Error",
    suggestion: error.message,
    icon: "!",
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">{title}</h3>
            <p className="mt-1 text-red-600 dark:text-red-300">{suggestion}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
