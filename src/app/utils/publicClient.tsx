import { getPublicClient } from "@wagmi/core";
import { config } from "@/app/utils/config";
// import { createWalletClient, custom } from "viem";

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
    default: { name: "bttc scan", url: "https://testscan.bittorrentchain.io/" },
  },
  testnet: true,
};

// Define a union type of allowed chain IDs
type AllowedChainIds =
  typeof bittorrentchainTestnet.id

// export const walletClient =
//   createWalletClient({
//     chain: bittorrentchainTestnet,
//     transport: custom(window.ethereum!),
//   })

// Utility function to initialize a client for a specific chain
export const initializeClient = (chainId: AllowedChainIds) => {
  const client = getPublicClient(config, { chainId });
  return client;
};


