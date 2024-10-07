
import Link from "next/link";
import React from "react";
import { CircleCheck, Orbit } from 'lucide-react'
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Welcome() {
    return (
        <div className="min-h-screen bg-black text-white">
            <header className="flex justify-between items-center py-3 px-6 bg-dark-gray border-b border-border-light">
                <div className="flex items-center space-x-2">
                    <Orbit className="w-6 h-6 text-accent" />
                    <span className="text-[#12FF80] font-bold text-xl">Orbit</span>
                </div>
                <ConnectButton />
            </header>

            <main className="container mx-auto px-4 mt-16 flex gap-4 min-h-[75vh] ">
                <div className="w-1/2 bg-accent p-12 rounded-lg text-black ">
                    <h1 className="text-5xl font-bold mb-6">Unlock a new way of ownership</h1>
                    <p className="mb-8 text-lg">
                        The most trusted decentralized custody protocol and collective asset management platform.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center">
                            <CircleCheck className="w-6 h-6 mr-2" />
                            Stealth security with multiple signers
                        </li>
                        <li className="flex items-center">
                            <CircleCheck className="w-6 h-6 mr-2" />
                            Make it yours with modules and guards
                        </li>

                    </ul>
                </div>

                <div className="w-1/2 pl-12 bg-dark-gray rounded-lg p-12 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-2 mb-6">
                            <Orbit className="w-6 h-6 text-white" />
                            <span className="text-white font-bold text-xl">Orbit</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-4">Get started</h2>
                        <p className="text-gray-400 mb-6 max-w-xs text-center">
                            Connect your wallet to create a new Safe Account or open an existing one
                        </p>
                        <button className="bg-accent text-black font-semibold py-3 px-6 rounded max-w-max">
                            Connect wallet
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Welcome;