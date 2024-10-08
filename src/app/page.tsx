
import Link from "next/link";
import React from "react";
import { CircleCheck, Orbit } from 'lucide-react'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";

const WelcomeComponent = dynamic(() => import("@/app/Components/pages/welcome/Welcome"), { ssr: false })

function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-dmsans">

      <main className="container mx-auto px-4 mt-16 flex gap-4 min-h-[75vh] ">
        <div className="w-1/2 bg-accent p-12 rounded-lg text-black">
          <h1 className="text-5xl font-bold mb-6">Revolutionize Your Ownership Experience</h1>
          <p className="mb-8 text-lg">
            Introducing the ultimate multisig wallet, powered by innovative calendar features for effortless budget management.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <CircleCheck className="w-6 h-6 mr-2" />
              Enhanced security with multi-signer protection
            </li>
            <li className="flex items-center">
              <CircleCheck className="w-6 h-6 mr-2" />
              Tailor your experience with customizable modules and safeguards
            </li>
            <li className="flex items-center">
              <CircleCheck className="w-6 h-6 mr-2" />
              Streamlined budgeting with intuitive calendar integration
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
              Connect your wallet to create a new Orbit Multisig Wallet or open an existing one
            </p>
            <WelcomeComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;