"use client";
import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { MultisigWallet } from "@/app/types/types";
import { Address, createPublicClient, formatUnits, http } from "viem";

export const bittorrentchainTestnet = {
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

const publicClient = createPublicClient({
    chain: bittorrentchainTestnet,
    transport: http("https://pre-rpc.bittorrentchain.io/"),
});

function Accounts() {
    const { address } = useAccount();
    const [userWallets, setUserWallets] = useState<MultisigWallet[]>([]);
    const [balances, setBalances] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWallets = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/wallet/get-by-user?createdBy=${address}`);
                const data = await response.json();

                if (response.ok) {
                    console.log(data);
                    setUserWallets(data.wallets.length > 0 ? data.wallets : []);
                } else {
                    setError(data.message || 'Failed to fetch wallets');
                }
            } catch (err) {
                setError('An error occurred while fetching wallets');
            } finally {
                setLoading(false);
            }
        };

        if (address) { fetchWallets(); }
    }, [address]);

    useEffect(() => {
        const fetchBalances = async () => {
            const newBalances: { [key: string]: string } = {};

            for (const wallet of userWallets) {
                try {
                    const balance = await publicClient.getBalance({ address: wallet.walletAddress as Address });
                    newBalances[wallet.walletAddress] = balance.toString(); // Convert balance to string for easier display
                } catch (err) {
                    console.error(`Failed to fetch balance for ${wallet.walletAddress}:`, err);
                    newBalances[wallet.walletAddress] = "Error fetching balance";
                }
            }

            setBalances(newBalances);
        };

        if (userWallets.length > 0) { fetchBalances(); }
    }, [userWallets]);

    return (
        <div className="min-h-screen bg-dark-black text-white p-8 font-dmsans">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Orbit Multisig Wallets</h1>
                    <Link href="/new-orbit/create" className="bg-accent text-black font-semibold py-2 px-4 rounded">
                        Create account
                    </Link>
                </div>

                <div className="bg-dark-gray rounded-lg p-8 mb-6">
                    <h2 className="text-md font-semibold mb-4">
                        My accounts <span className="text-gray-500">{userWallets.length > 0 && `(${userWallets.length})`}</span>
                    </h2>
                    {userWallets.length > 0 ? userWallets.map((wallet) => (
                        <Link key={wallet.walletAddress} href={`/user-home/${wallet.walletAddress}`} className="block border border-border-light rounded-lg p-4 hover:bg-[#ffffff14] cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="relative w-10 h-10">
                                        <Blockies
                                            className="table-user-gradient rounded-full"
                                            seed={wallet.walletAddress ? wallet.walletAddress.toString() : "Orbit MultiSig"}
                                            size={15}
                                            scale={3}
                                        />
                                        <div className="absolute top-0 -right-2 bg-accent text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {wallet.requiredSignatures}/{wallet.signerAddresses.length}
                                        </div>
                                    </div>
                                    <div className="pl-4">
                                        <p className="font-medium">{wallet.name}</p>
                                        <p className="text-gray-500 font-medium">{wallet.walletAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                               
                                <span className="text-white ml-2">
                                {balances[wallet.walletAddress] ? formatUnits(BigInt(balances[wallet.walletAddress]), 18) : "Loading..."}
                                </span>
                                <span className="font-bold">BTT</span>
                                <button>
                                <MoreVertical className="text-gray-400" />
                                </button>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center text-md text-gray-400">
                                <span className="text-gray-400 mr-2">Threshold -</span>
                                <span className="text-white mr-2">{wallet.requiredSignatures} <span className="text-gray-500">out of {wallet.signerAddresses.length} signer(s)</span></span>
                            </div>
                            <div className="mt-6 flex items-center text-md text-gray-400">
                                {wallet.createdAt ? <>
                                    <span className="text-gray-400 mr-4"> Created at -</span>
                                    <span className="text-white mr-2">
                                        {new Date(wallet.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </span>
                                </> : null}
                            </div>
                        </Link>
                    )) : (
                        <p className="text-gray-400 text-center py-8">
                            You don't have any Orbit Multisig Smart Wallets yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Accounts;
