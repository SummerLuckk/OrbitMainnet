
"use client"
import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { MultisigWallet } from "@/app/types/types";
import { truncateAddress } from "@/app/utils/truncateAddress";
import { formatDate } from "@/app/utils/formatDate";

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
            <div className="min-h-screen bg-dark-black text-white p-4 md:p-8 font-dmsans">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col-reverse md:flex-row justify-between items-center my-8">
                        <h1 className="text-3xl font-bold my-6 md:my-0">Orbit Multisig Wallets</h1>
                        <Link href="/new-orbit/create" className="bg-accent text-black font-semibold py-2 px-4 rounded">
                            Create New Account
                        </Link>
                    </div>

                    <div className="bg-dark-gray rounded-lg p-6 md:p-8 mb-6">
                        <h2 className="text-md font-semibold mb-4">
                            My accounts <span className="text-gray-500">{hasAccounts && "(" + userWallets?.length + ")"}</span>
                        </h2>
                        {userWallets.length > 0 ? userWallets.map((wallet, index) => (
                            <Link
                                key={index}
                                href={`/user-home/${wallet.walletAddress}`}
                                className="hidden md:block border border-border-light rounded-lg p-4 hover:bg-[#ffffff14] cursor-pointer" >

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
                                            <p className="text-gray-500 font-medium">{truncateAddress(wallet.walletAddress)}</p>

                                        </div>
                                    </div>
                                    <div className="hidden md:block flex items-center space-x-3">

                                        <span className="font-bold">BTTC</span>
                                        <button>
                                            <MoreVertical className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-0 text-md text-gray-400">
                                    <span className="text-gray-400 mr-2">Threshold :</span>
                                    <span className="text-white mr-2">{wallet.requiredSignatures} <span className="text-gray-500">out of {wallet.signerAddresses.length} signer(s)</span></span>
                                </div>

                                <div className="mt-4 flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-0 text-md text-gray-400">
                                    {wallet.createdAt ? <><span className="text-gray-400 mr-4"> Created at :</span><span className="text-white mr-2">
                                        {formatDate(wallet.createdAt)}
                                    </span> </> : null}
                                </div>
                            </Link>)
                        ) : (
                            <p className="text-gray-400 text-center py-8">
                                You don't have any Orbit Multisig Smart Wallets yet
                            </p>
                        )}

                        {userWallets.length > 0 ? userWallets.map((_wallet) => (<Link href={`/user-home/${_wallet.walletAddress}`}>{_wallet.walletAddress}</Link>)) : <div>Not found</div>}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Accounts;