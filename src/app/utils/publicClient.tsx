import { getPublicClient } from "@wagmi/core";
import { config } from "@/app/utils/config";
// import { createWalletClient, custom } from "viem";

const bittorrentchainMainnet = {
  id: 199,
  name: "BitTorrent Chain",
  nativeCurrency: {
    decimals: 18,
    name: "BitTorrent Chain",
    symbol: "BTT",
  },
  rpcUrls: {
    default: { http: ["https://rpc.bittorrentchain.io"] },
  },
  blockExplorers: {
    default: { name: "bttc scan", url: "https://bttcscan.com/" },
  },
  testnet: false,
};

// Define a union type of allowed chain IDs
type AllowedChainIds =
  typeof bittorrentchainMainnet.id

// export const walletClient =
//   createWalletClient({
//     chain: bittorrentchainMainnet,
//     transport: custom(window.ethereum!),
//   })

// Utility function to initialize a client for a specific chain
export const initializeClient = (chainId: AllowedChainIds) => {
  const client = getPublicClient(config, { chainId });
  return client;
};


