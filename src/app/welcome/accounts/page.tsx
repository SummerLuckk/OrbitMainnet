
"use client"
import React, { useState } from "react";
import Image from "next/image";
import Blockies from "react-blockies";
import { ArrowUp, Eye, MoreVertical } from "lucide-react";
import Navbar from "@/app/Components/Navbar";

function Accounts() {
    const [hasAccounts, setHasAccounts] = useState(true)
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#121212] text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Safe accounts</h1>
                        <button className="bg-[#12FF80] text-black font-semibold py-2 px-4 rounded">
                            Create account
                        </button>
                    </div>

                    <div className="bg-dark-gray rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            My accounts {hasAccounts && '(1)'}
                        </h2>
                        {hasAccounts ? (
                            <div className=" border border-border-light rounded-lg p-4 hover:bg-[#ffffff14] cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative w-10 h-10">
                                            <Blockies
                                                className="table-user-gradient rounded-full"
                                                seed={
                                                    "something can be added here"
                                                }
                                                size={15}
                                                scale={3}

                                            />
                                            <div className="absolute top-0 -right-2 bg-[#12FF80] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                1/1
                                            </div>
                                        </div>
                                        <div className="pl-4">
                                            <p className="font-medium">WalletName</p>
                                            <p className="font-medium">0x3781...3206</p>

                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">

                                        <span className="font-bold">BTTC</span>
                                        <button>
                                            <MoreVertical className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-gray-400">
                                    1 threshold
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">
                                You don't have any Safe Accounts yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Accounts;