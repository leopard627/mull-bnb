"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWallet() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-md md:gap-2 md:px-4 md:py-2 md:text-sm"
                  >
                    <WalletIcon className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-red-600 md:gap-2 md:px-4 md:py-2 md:text-sm"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="hidden items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 sm:flex dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                  >
                    {chain.hasIcon && (
                      <div
                        className="h-4 w-4 overflow-hidden rounded-full"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="h-4 w-4"
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden md:inline">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 md:gap-2 md:px-3 md:py-2 md:text-sm dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 md:h-6 md:w-6">
                      <WalletIcon className="h-3 w-3 text-white md:h-3.5 md:w-3.5" />
                    </div>
                    <span>{account.displayName}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}
