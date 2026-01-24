"use client";

import Image from "next/image";
import type { Network } from "@/lib/types";
import { TransactionInput } from "./TransactionInput";
import { ThemeToggle } from "./ThemeToggle";
import { ConnectWallet } from "./ConnectWallet";

interface NetworkSelectorProps {
  currentNetwork: Network;
  onSelect: (network: Network) => void;
}

function NetworkSelector({ currentNetwork, onSelect }: NetworkSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 md:gap-1 md:p-1 dark:bg-slate-800">
      <button
        onClick={() => onSelect("mainnet")}
        className={`rounded-md px-2 py-1 text-xs font-medium transition-all md:px-3 md:py-1.5 md:text-sm ${
          currentNetwork === "mainnet"
            ? "bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        }`}
      >
        Mainnet
      </button>
      <button
        onClick={() => onSelect("testnet")}
        className={`rounded-md px-2 py-1 text-xs font-medium transition-all md:px-3 md:py-1.5 md:text-sm ${
          currentNetwork === "testnet"
            ? "bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        }`}
      >
        Testnet
      </button>
    </div>
  );
}

interface HeaderProps {
  showDetailView: boolean;
  currentNetwork: Network;
  setCurrentNetwork: (network: Network) => void;
  onReset: () => void;
  onSubmit: (digest: string, network: Network) => void;
  isLoading: boolean;
  lastDigest: string;
  transaction: unknown;
  onNetworkNavigation: (network: Network) => void;
}

export function Header({
  showDetailView,
  currentNetwork,
  setCurrentNetwork,
  onReset,
  onSubmit,
  isLoading,
  lastDigest,
  transaction,
  onNetworkNavigation,
}: HeaderProps) {
  const handleNetworkSelect = (network: Network) => {
    setCurrentNetwork(network);
    if (!transaction && !lastDigest) {
      onNetworkNavigation(network);
    }
  };

  return (
    <header
      className={`border-b border-slate-200 px-4 dark:border-slate-800 ${showDetailView ? "py-4" : "py-6 md:py-8"}`}
    >
      <div className="mx-auto max-w-6xl">
        {showDetailView ? (
          // Detail view header: Logo | Search | Network
          <div className="space-y-3 md:space-y-0">
            {/* Mobile: Two rows */}
            <div className="flex items-center justify-between md:hidden">
              {/* Logo - Compact */}
              <button onClick={onReset} className="shrink-0 transition-opacity hover:opacity-80">
                <Image
                  src="/logo.png"
                  alt="Mull"
                  width={120}
                  height={48}
                  className="-my-2 h-12 w-auto"
                />
              </button>
              {/* Network Selector, Wallet & Theme Toggle */}
              <div className="flex shrink-0 items-center gap-2">
                <NetworkSelector currentNetwork={currentNetwork} onSelect={handleNetworkSelect} />
                <ConnectWallet />
                <ThemeToggle />
              </div>
            </div>
            {/* Mobile: Search on second row */}
            <div className="md:hidden">
              <TransactionInput
                onSubmit={onSubmit}
                isLoading={isLoading}
                initialDigest={lastDigest}
                network={currentNetwork}
                variant="compact"
                onNetworkChange={setCurrentNetwork}
              />
            </div>

            {/* Desktop: Single row */}
            <div className="hidden items-center gap-4 md:flex">
              {/* Logo - Compact */}
              <button onClick={onReset} className="shrink-0 transition-opacity hover:opacity-80">
                <Image
                  src="/logo.png"
                  alt="Mull"
                  width={160}
                  height={64}
                  className="-my-3 h-16 w-auto"
                />
              </button>

              {/* Search Input - Compact */}
              <TransactionInput
                onSubmit={onSubmit}
                isLoading={isLoading}
                initialDigest={lastDigest}
                network={currentNetwork}
                variant="compact"
                onNetworkChange={setCurrentNetwork}
              />

              {/* Network Selector, Wallet & Theme Toggle */}
              <div className="flex shrink-0 items-center gap-2">
                <NetworkSelector currentNetwork={currentNetwork} onSelect={handleNetworkSelect} />
                <ConnectWallet />
                <ThemeToggle />
              </div>
            </div>
          </div>
        ) : (
          // Home view header: Logo and Network only
          <div className="flex items-center justify-between">
            <button onClick={onReset} className="transition-opacity hover:opacity-80">
              <Image
                src="/logo.png"
                alt="Mull"
                width={200}
                height={80}
                className="-my-4 h-[72px] w-auto md:h-20"
              />
            </button>
            <div className="flex items-center gap-2">
              <NetworkSelector currentNetwork={currentNetwork} onSelect={handleNetworkSelect} />
              <ConnectWallet />
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
