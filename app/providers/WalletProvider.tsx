"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Mull - BNB Transaction Explainer",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [bsc, bscTestnet],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

interface AppWalletProviderProps {
  children: React.ReactNode;
}

export function AppWalletProvider({ children }: AppWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
