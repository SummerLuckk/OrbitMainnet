
"use client"
import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { MoreVertical } from "lucide-react";
import Navbar from "@/app/Components/Navbar";
import Link from "next/link";
import { useAccount } from "wagmi";
import { MultisigWallet } from "@/app/types/types";

function Accounts() {
    const { address } = useAccount();
    const [userWallets, setUserWallets] = useState<MultisigWallet[] | []>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWallets = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/wallet/get-by-user?createdBy=${address}`);
                const data = await response.json();

                if (response.ok) {
                    console.log(data)
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


    const [hasAccounts, setHasAccounts] = useState(true)
    return (
        <>
            <Navbar />
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
                            My accounts <span className="text-gray-500">{hasAccounts && "(" + userWallets?.length + ")"}</span>
                        </h2>
                        {userWallets.length > 0 ? userWallets.map((wallet) => (
                            <Link href={`/user-home/${wallet.walletAddress}`} className="block border border-border-light rounded-lg p-4 hover:bg-[#ffffff14] cursor-pointer" >
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
                                        <div className="pl-4 ">
                                            <p className="font-medium">{wallet.name}</p>
                                            <p className="text-gray-500 font-medium">{wallet.walletAddress}</p>

                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">

                                        <span className="font-bold">BTTC</span>
                                        <button>
                                            <MoreVertical className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center text-md text-gray-400">
                                    <span className="text-white mr-2">{wallet.requiredSignatures}</span> threshold
                                </div>
                            </Link>)
                        ) : (
                            <p className="text-gray-400 text-center py-8">
                                You don't have any Orbit Multisig Smart Wallets yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Accounts;