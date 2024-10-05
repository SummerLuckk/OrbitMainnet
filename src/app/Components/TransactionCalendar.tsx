import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from '../utils/publicClient';
import { Calendar, momentLocalizer } from 'react-big-calendar';
const moment = require('moment')
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatUnits } from 'ethers';

const localizer = momentLocalizer(moment);
const factoryAddress = '0x...'; // Replace with your deployed factory address

interface Transaction {
  txIndex: number;
  receiver: string;
  amount: bigint;
  tokenAddress: string;
  executed: boolean;
  nonce: string;
  date: number;
}

const TransactionCalendar = () => {
  const [userWallets, setUserWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [transactions, setTransactions] =  useState<Transaction[]>([]);

  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();

  const factoryContract = getContract({
    address: factoryAddress as `0x${string}`,
    abi: OrbitWalletFactoryABI,
    client: client,
  });

  useEffect(() => {
    if (address) {
      getUserWallets();
    }
  }, [address]);

  const getUserWallets = async () => {
    try {
      const wallets = await factoryContract.read.getUserWallets([address]);
      setUserWallets(wallets);
    } catch (error) {
      console.error('Error fetching user wallets:', error);
    }
  };

  const getWalletTransactions = async (walletAddress :Address) => {
    const walletContract = getContract({
      address: walletAddress as `0x${string}`,
      abi: OrbitWalletABI,
      client: client,
    });
    
    try {
      const transactionsData = await walletContract.read.getAllTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (selectedWallet) {
      getWalletTransactions(selectedWallet as Address);
    }
  }, [selectedWallet]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transaction Calendar</h2>
      <select
        value={selectedWallet}
        onChange={(e) => setSelectedWallet(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select a wallet</option>
        {userWallets.map((wallet, index) => (
          <option key={index} value={wallet}>{wallet}</option>
        ))}
      </select>
      <Calendar
        localizer={localizer}
        events={transactions.map(tx => ({
          title: `${formatUnits(tx.amount, 18)} BTT to ${tx.receiver}`,
          start: new Date(tx.date),
          end: new Date(tx.date),
          allDay: true,
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default TransactionCalendar;