"use client";

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, CircleCheck, Copy, CopyCheck, Home, Menu, PanelLeftClose, PanelLeftOpen, PlusCircle, Settings } from 'lucide-react';
import Blockies from "react-blockies";
import Dashboard from './Dashboard';
import NewTransaction from './NewTransaction';
import WalletSettings from './WalletSettings';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { truncateAddress } from '@/app/utils/truncateAddress';
import { Address, createPublicClient, formatUnits, http } from 'viem';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [balance, setBalance] = useState<string | null>(null);
    const params = useParams();
    const sidebarRef = useRef<HTMLDivElement>(null)
    const walletAddress = params.address;
    const [copyStatus, setCopyStatus] = useState<{ [key: string]: boolean }>({});

    const handleClickOutside = (event: MouseEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
            setIsSidebarOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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
                    const balanceData = await publicClient.getBalance({ address: walletAddress as Address });
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
            return <Dashboard balance={balance ? balance : null} />;
        case 'New Transaction':
            return <NewTransaction />;
        case 'Settings':
            return <WalletSettings />;
        default:
            return null;
        }
    };

    const menuItems: MenuItem[] = ['Dashboard', 'New Transaction', 'Settings'];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleMenuItemClick = (item: MenuItem) => {
        setActiveMenuItem(item as MenuItem)
        toggleSidebar()
    }

    const handleCopy = (address: string, identifier: string) => {
        navigator.clipboard.writeText(address).then(() => {
            // Show the check icon for 2 seconds after copying
            setCopyStatus((prev) => ({ ...prev, [identifier]: true }));
            setTimeout(() => {
                setCopyStatus((prev) => ({ ...prev, [identifier]: false }));
            }, 2000);
        });
    };

    return (
        <div className="flex w-full h-[calc(100vh-64.8px)] bg-dark-black text-white font-dmsans">
            {/* Hamburger button for mobile */}
            {!isSidebarOpen && <Button
                variant="ghost"
                size="icon"
                className="fixed top-20 bg-accent left-0 z-20 md:hidden rounded-none rounded-r-lg"
                onClick={toggleSidebar}
            >
                <PanelLeftOpen className="h-6 w-6 text-black " />
            </Button>}
            {/* Sidebar */}
            <div className=" hidden md:flex w-64 bg-dark-gray flex-col h-full overflow-y-auto">

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
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button className="rounded-lg bg-black text-accent p-2" onClick={() => handleCopy(walletAddress.toString(), "profile")}>
                                                {copyStatus['profile'] ? <CircleCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className='bg-black text-white'>
                                            <p>Copy Address</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                            </div>
                        </div>
                    </div>

                    <button className="mt-6 mb-4 w-full rounded-lg bg-accent py-2 text-center font-semibold text-black"
                        onClick={() => handleMenuItemClick('New Transaction')}>
                        New Transaction
                    </button>
                </div>
                <nav className='px-4'>
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item}>
                                <button
                                    className={`flex w-full items-center text-sm font-bold rounded-lg p-4 ${activeMenuItem === item ? 'bg-border-light' : 'hover:bg-accent-light'}`}
                                    onClick={() => handleMenuItemClick(item as MenuItem)} // Cast item to MenuItem
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
                <ul className="mt-auto space-y-2 py-4 px-4 border-t border-border-light">
                    <li>
                        <Link
                            href={"/welcome/accounts"}
                            className="flex w-full items-center text-sm font-bold rounded-lg p-4 hover:bg-accent-light"
                        >
                            <ChevronLeft className="mr-4 w-4 h-4" />
                            Back to Wallets
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 md:p-8 pt-20 md:pt-10 overflow-y-scroll custom-scroll">
                <h2 className="mb-4 text-2xl font-semibold">{activeMenuItem}</h2>
                {renderContent()}
            </div>

            {/* Overlay for mobile when sidebar is open */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div
                    ref={sidebarRef}
                    className={`relative flex flex-col w-64 bg-dark-gray z-100 h-screen transform transition-transform duration-300 delay-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <ul className="space-y-2 py-4 px-4 border-b border-border-light">
                        <li>
                            <div
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex w-full items-center text-md font-bold rounded-lg p-4 hover:bg-accent-light"
                            >
                                <PanelLeftClose className="mr-4 w-5 h-5" />
                                Close
                            </div>
                        </li>
                    </ul>
                    {/* Profile Section */}
                    <div className="mb-6 px-4 py-4 border-b border-border-light">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className='relative'>
                                    <Blockies
                                        seed="Just For Fun"
                                        size={10}
                                        scale={5}
                                        className=" rounded-full"
                                    />
                                    <div className="absolute top-0 -right-2 bg-accent text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {walletDetails?.requiredSignatures}/{walletDetails?.signerAddresses.length}
                                    </div>
                                </div>
                                <div className='ml-4'>
                                    <p className="text-sm font-semibold">{walletDetails ? walletDetails.name : "Just For Fun"}</p>
                                    <p className="text-xs text-gray-400">{walletAddress ? truncateAddress(walletAddress.toString()) : ""}</p>
                                    <p className="text-xs text-gray-400">Balance: {balance !== null ? balance : "Loading..."} <span className="font-bold">BTT</span></p>
                                </div>
                                <div className="ml-4 flex justify-start gap-4">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button className="rounded-lg bg-black text-accent p-2" onClick={() => handleCopy(walletAddress.toString(), "profile")}>
                                                    {copyStatus['profile'] ? <CircleCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className='bg-black text-white'>
                                                <p>Copy Address</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>

                        <button className="mt-6 mb-4 w-full rounded-lg bg-accent py-2 text-center font-semibold text-black"
                            onClick={() => handleMenuItemClick('New Transaction')}>
                            New Transaction
                        </button>
                    </div>
                    <nav className='px-4'>
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item}>
                                    <button
                                        className={`flex w-full items-center text-sm font-bold rounded-lg p-4 ${activeMenuItem === item ? 'bg-border-light' : 'hover:bg-accent-light'}`}
                                        onClick={() => handleMenuItemClick(item as MenuItem)} // Cast item to MenuItem
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
                    <ul className="mt-auto space-y-2 py-4 px-4 border-t border-border-light">
                        <li>
                            <Link
                                href={"/welcome/accounts"}
                                className="flex w-full items-center text-sm font-bold rounded-lg p-4 hover:bg-accent-light"
                            >
                                <ChevronLeft className="mr-4 w-4 h-4" />
                                Back to Wallets
                            </Link>
                        </li>
                    </ul>

                </div>
            </div>
        </div>
    );


}
