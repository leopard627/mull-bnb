"use client";

import type { Network } from "@/lib/types";

interface NetworkSelectorProps {
  network: Network;
  onChange: (network: Network) => void;
  disabled?: boolean;
}

export function NetworkSelector({ network, onChange, disabled }: NetworkSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => onChange("mainnet")}
        disabled={disabled}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          network === "mainnet"
            ? "bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        Mainnet
      </button>
      <button
        type="button"
        onClick={() => onChange("testnet")}
        disabled={disabled}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          network === "testnet"
            ? "bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        Testnet
      </button>
    </div>
  );
}
