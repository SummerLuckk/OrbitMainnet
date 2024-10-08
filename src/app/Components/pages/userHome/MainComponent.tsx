"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Grid, Home, Layers, PlusCircle, Settings, Share2 } from 'lucide-react'
import { Address } from 'viem'
import Navbar from '../../Navbar'
import Blockies from "react-blockies";
import Dashboard from './Dashboard'
import NewTransaction from './NewTransaction'
import WalletSettings from './WalletSettings'
import Link from 'next/link'

type MenuItem = 'Dashboard' | 'New Transaction' | 'Settings'

const menuItems: MenuItem[] = ['Dashboard', 'New Transaction', 'Settings']

interface MainComponentProps {
    contractAddress: Address;
}
export default function MainComponent({ contractAddress }: MainComponentProps) {
    const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>('Dashboard')

    const renderContent = () => {
        switch (activeMenuItem) {
        case 'Dashboard':
            return <Dashboard />
        case 'New Transaction':
            return <NewTransaction />
        case 'Settings':
            return <WalletSettings />
        default:
            return null
        }
    }

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-dark-black text-white font-dmsans">
                {/* Sidebar */}
                <div className="w-64 bg-dark-gray ">
                    <ul className="space-y-2 py-4 px-4 border-b border-border-light">

                        <li >
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
                                    <p className="text-sm font-semibold">Just For Fun</p>
                                    <p className="text-xs text-gray-400">sep:0x3781...3206</p>
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
                                        className={`flex w-full items-center text-sm font-bold rounded-lg p-4 ${activeMenuItem === item ? 'bg-border-light' : 'hover:bg-accent-light'
                                            }`}
                                        onClick={() => setActiveMenuItem(item)}
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
        </>
    )
}

