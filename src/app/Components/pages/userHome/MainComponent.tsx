"use client";

import { useEffect, useState } from 'react';
import { ChevronLeft, Copy, Home, PlusCircle, Settings } from 'lucide-react';
import Blockies from "react-blockies";
import Dashboard from './Dashboard';
import NewTransaction from './NewTransaction';
import WalletSettings from './WalletSettings';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { truncateAddress } from '@/app/utils/truncateAddress';
import { Address, createPublicClient, formatUnits, http } from 'viem';


const bittorrentchainTestnet = {
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
};

const publicClient = createPublicClient({
    chain: bittorrentchainTestnet,
    transport: http("https://pre-rpc.bittorrentchain.io/"),
});

type MenuItem = 'Dashboard' | 'New Transaction' | 'Settings';
type SignerWithName = { name: string; address: string; };
type Wallet = {
    _id: string;
    walletAddress: string;
    name: string;
    signerAddresses: string[];
    signerWithName: SignerWithName[];
    createdBy: string;
    createdAt: string;
    requiredSignatures: string;
};

export default function MainComponent() {
    const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>('Dashboard');
    const [walletDetails, setWalletDetails] = useState<Wallet | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const params = useParams();
    const walletAddress = params.address;

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const response = await fetch(`/api/wallet/get-single-wallet-details?walletAddress=${walletAddress}`);
                const data = await response.json();

                if (response.ok) {
                    setWalletDetails(data.wallet.length > 0 ? data.wallet[0] : null);
                }
            } catch (err) {
                console.log('An error occurred while fetching wallets');
            }
        };

        const fetchBalance = async () => {
            if (walletAddress) {
                try {
                    const balanceData = await publicClient.getBalance({ address: walletAddress as Address});
                    setBalance(formatUnits(balanceData, 18));
                } catch (err) {
                    console.error('Error fetching balance:', err);
                    setBalance(null);
                }
            }
        };

        if (walletAddress) {
            fetchWallets();
            fetchBalance();
        }
    }, [walletAddress]);

    const renderContent = () => {
        switch (activeMenuItem) {
            case 'Dashboard':
                return <Dashboard />;
            case 'New Transaction':
                return <NewTransaction />;
            case 'Settings':
                return <WalletSettings />;
            default:
                return null;
        }
    };

    const menuItems: MenuItem[] = ['Dashboard', 'New Transaction', 'Settings'];



    return (
        <div className="flex min-h-screen bg-dark-black text-white font-dmsans">
            {/* Sidebar */}
            <div className="w-64 bg-dark-gray">
                <ul className="space-y-2 py-4 px-4 border-b border-border-light">
                    <li>
                        <Link
                            href={"/welcome/accounts"}
                            className="flex w-full items-center text-sm font-bold rounded-lg p-4 bg-border-light"
                        >
                            <ChevronLeft className="mr-4 w-4 h-4" />
                            Back to Wallets
                        </Link>
                    </li>
                </ul>
                {/* Profile Section */}
                <div className="mb-6 px-4 py-4 border-b border-border-light">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Blockies
                                seed="Just For Fun"
                                size={10}
                                scale={5}
                                className="mr-3 rounded-full"
                            />
                            <div>
                                <p className="text-sm font-semibold">{walletDetails ? walletDetails.name : "Just For Fun"}</p>
                                <p className="text-xs text-gray-400">{walletAddress ? truncateAddress(walletAddress.toString()) : ""}</p>
                                <p className="text-xs text-gray-400">Balance: {balance !== null ? balance : "Loading..."} <span className="font-bold">BTT</span></p>
                            </div>
                            <div className="ml-4 flex justify-start gap-4">
                                <button className="rounded-lg bg-black text-accent p-2">
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className="mt-6 mb-4 w-full rounded-lg bg-accent py-2 text-center font-semibold text-black"
                        onClick={() => setActiveMenuItem('New Transaction')}>
                        New transaction
                    </button>
                </div>
                <nav className='px-4'>
    <ul className="space-y-2">
        {menuItems.map((item) => (
            <li key={item}>
                <button
                    className={`flex w-full items-center text-sm font-bold rounded-lg p-4 ${activeMenuItem === item ? 'bg-border-light' : 'hover:bg-accent-light'}`}
                    onClick={() => setActiveMenuItem(item as MenuItem)} // Cast item to MenuItem
                >
                    {item === 'Dashboard' && <Home className="mr-4 w-4 h-4" />}
                    {item === 'New Transaction' && <PlusCircle className="mr-4 w-4 h-4" />}
                    {item === 'Settings' && <Settings className="mr-4 w-4 h-4" />}
                    {item}
                </button>
            </li>
        ))}
    </ul>
</nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8">
                <h2 className="mb-4 text-2xl font-semibold">{activeMenuItem}</h2>
                {renderContent()}
            </div>
        </div>
    );

    
}
