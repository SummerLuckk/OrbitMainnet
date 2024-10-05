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

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <ScheduleTransaction contractAddress={contractAddress} />;
      case 'calendar':
        return <TransactionCalendar contractAddress={contractAddress} />;
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Orbit Multisig Wallet</h1>
      <p>Wallet Address = {contractAddress}</p>
      
      {/* Display threshold and members */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Wallet Information</h2>
        <p className="mt-2">Threshold: <span className="font-bold">{threshold !== null ? Number(threshold) : 'Loading...'}</span></p>
        <h3 className="mt-4 font-semibold">Members:</h3>
        {members ? (
          <ul className="list-disc pl-6 mt-2">
            {members.map((member, index) => (
              <li key={index} className="mt-1">{member}</li>
            ))}
          </ul>
        ) : (
          <p>Loading members...</p>
        )}
      </div>

      <nav className="mb-6">
        <button
          onClick={() => setCurrentPage('schedule')}
          className={`mr-4 px-4 py-2 rounded ${currentPage === 'schedule' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Schedule Transaction
        </button>
        <button
          onClick={() => setCurrentPage('calendar')}
          className={`px-4 py-2 rounded ${currentPage === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Transaction Calendar
        </button>
      </nav>

      {renderPage()}
    </div>
  );
};

export default UserWallet;
