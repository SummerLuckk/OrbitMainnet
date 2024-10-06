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

const publicClient = createPublicClient({
  chain: {
    id: 1028, // BTTC Donau testnet chain ID
    rpcUrls: {
      public: "https://pre-rpc.bittorrentchain.io/", // BTTC Donau testnet RPC URL
    },
  },
  transport: http("https://pre-rpc.bittorrentchain.io/"), // Passing RPC URL to http function
});

// Define the function with proper types for parameters and return value
export async function getTokenDetails(TokenAddress: string, userAddress: string): Promise<TokenDetails | null> {
  try {
    const contract = getContract({
      address: TokenAddress as `0x${string}`, // Ensure the address is of the right format
      abi: erc20Abi.abi,
      client: publicClient,
    });
    const name: string = await contract.read.name();
    const symbol: string = await contract.read.symbol();
    const decimals: number = await contract.read.decimals(); // Assuming decimals is returned as a number
    const balance: bigint = await contract.read.balanceOf([userAddress as `0x${string}`]); // Ensure address is of the right format

    // console.log(balance);
    return {
      name,
      symbol,
      decimals: decimals.toString(),
      balance :balance,
    };
  } catch (error: any) {
    console.log("loading token error", error.message);
    return null;
  }
}
