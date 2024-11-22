import { http, createConfig } from "@wagmi/core";


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
export const config = createConfig({
  chains: [bittorrentchainMainnet],
  transports: {
    [bittorrentchainMainnet.id]: http(),
   
  },
});
