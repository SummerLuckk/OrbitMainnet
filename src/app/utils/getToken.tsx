import { createPublicClient, http } from "viem";
import erc20Abi from "./ERC20ABI.json";
import { getContract } from "viem";

// Define types for the response object
interface TokenDetails {
  name: string;
  symbol: string;
  decimals: string;
  balance: bigint; // Assuming balance is a BigInt
}

export const bittorrentchainMainnet = {
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
    default: { name: "schedule-transactions scan", url: "https://bttcscan.com/" },
  },
  testnet: false,
};

const publicClient = createPublicClient({
  chain: bittorrentchainMainnet,
  transport: http("https://rpc.bittorrentchain.io"), // Passing RPC URL to http function
});

// Define the function with proper types for parameters and return value
export async function getTokenDetails(TokenAddress: string, userAddress: string): Promise<TokenDetails | null> {
  try {
    const contract = getContract({
      address: TokenAddress as `0x${string}`, // Ensure the address is of the right format
      abi: erc20Abi.abi,
      client: publicClient,
    });
    const name: any = await contract.read.name();
    const symbol: any = await contract.read.symbol();
    const decimals: any = await contract.read.decimals(); // Assuming decimals is returned as a number
    const balance: any = await contract.read.balanceOf([userAddress as `0x${string}`]); // Ensure address is of the right format

    // console.log(balance);
    return {
      name,
      symbol,
      decimals: decimals.toString(),
      balance: balance,
    };
  } catch (error: any) {
    console.log("loading token error", error.message);
    return null;
  }
}
