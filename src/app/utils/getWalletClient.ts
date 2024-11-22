import { createWalletClient, custom } from "viem";

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
    default: { name: "bttc scan", url: "https://bttcscan.com/" },
  },
  testnet: false,
};

export const getWalletClient = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return createWalletClient({
      chain: bittorrentchainMainnet,
      transport: custom(window.ethereum),
    });
  } else {
    console.warn("Ethereum provider not available");
    return null;
  }
};
