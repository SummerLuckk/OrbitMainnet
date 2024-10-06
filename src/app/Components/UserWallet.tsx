"use client";
import React, { useEffect, useState } from 'react';
import ScheduleTransaction from './ScheduleTransactions';
import TransactionCalendar from './TransactionCalendar';
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { initializeClient } from '../utils/publicClient';
import { useAccount } from 'wagmi';
import { config } from "@/app/utils/config";
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import Settings from './Settings';

interface UserWalletProps {
  contractAddress: Address;
}

const UserWallet: React.FC<UserWalletProps> = ({ contractAddress }) => {
  const [currentPage, setCurrentPage] = useState('calendar');
  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();
  const [threshold, setThreshold] = useState<number | null>(null);
  const [members, setMembers] = useState<Address[] | null>(null);

  const walletContract = getContract({
    address: contractAddress as `0x${string}`,
    abi: OrbitWalletABI,
    client: client,
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    alert("Address copied to clipboard");
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <ScheduleTransaction contractAddress={contractAddress} />;
      case 'calendar':
        return <TransactionCalendar contractAddress={contractAddress} />;
      case 'settings':
        return <Settings members={members} />;
        
      default:
        return <TransactionCalendar contractAddress={contractAddress} />;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (contractAddress) {
        try {
          const thresholdData = await walletContract.read.numConfirmationsRequired();
          const owners = await walletContract.read.getOwners();

          console.log(thresholdData, owners);
          setThreshold(thresholdData);
          setMembers(owners); // Set the members state with the fetched owners
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData(); // Call the fetch function
  }, [contractAddress]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-6" style={{ color: 'black' }}>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Orbit Multisig Wallet</h1>
          <div className="flex items-center space-x-2 mt-4">
            <p className="text-gray-700">{contractAddress}</p>
            <FaCopy className="cursor-pointer" onClick={handleCopyAddress} />
            <a href={`https://testnet.bttcscan.com/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt />
            </a>
          </div>
          <p className="mt-2">Threshold: <span className="font-bold">{threshold !== null ? Number(threshold) : 'Loading...'}</span></p>
        </div>

        {/* Sidebar navigation */}
        <nav>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setCurrentPage('schedule')}
                className={`w-full text-left px-4 py-2 rounded ${currentPage === 'schedule' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Schedule Transaction
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('calendar')}
                className={`w-full text-left px-4 py-2 rounded ${currentPage === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Transaction Calendar
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('settings')}
                className={`w-full text-left px-4 py-2 rounded ${currentPage === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Settings
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="w-3/4 p-6">
        {renderPage()}
      </div>
    </div>
  );
};

export default UserWallet;
