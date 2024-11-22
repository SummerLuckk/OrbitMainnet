'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

const bittorrentchainMainnet = {
    id: 199,
    name: "BitTorrent Chain",
    nativeCurrency: {
        decimals: 18,
        name: "BitTorrent Chain",
        symbol: "BTT",
    },
    rpcUrls: {
        default: { http: ["https://rpc.bt.io/"] },
    },
    blockExplorers: {
        default: { name: "schedule-transactions scan", url: "https://bttcscan.com/" },
    },
    testnet: false,
};

const queryClient = new QueryClient();
const config = getDefaultConfig({
    appName: "Orbit",
    projectId: "f8a6524307e28135845a9fe5811fcaa2",
    chains: [bittorrentchainMainnet],
    ssr: true,

});
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: '#FFE227',
                    accentColorForeground: 'black',
                    borderRadius: 'small',
                    fontStack: 'system',
                    overlayBlur: 'small',
                })}>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
