'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

const bittorrentchainTestnet = {
    id: 1029,
    name: "BitTorrent Chain Donau",
    nativeCurrency: {
        decimals: 18,
        name: "BitTorrent Chain Donau",
        symbol: "BTT",
    },
    rpcUrls: {
        default: { http: ["https://pre-rpc.bittorrentchain.io/"] },
    },
    blockExplorers: {
        default: { name: "schedule-transactions scan", url: "https://testscan.bittorrentchain.io/" },
    },
    testnet: true,
};

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    const config = getDefaultConfig({
        appName: "RainbowKit demo",
        projectId: "f8a6524307e28135845a9fe5811fcaa2",
        chains: [bittorrentchainTestnet],
        ssr: true,
    });
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
