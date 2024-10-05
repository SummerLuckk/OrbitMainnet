import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from '../utils/publicClient';
import { parseUnits } from 'ethers';

const factoryAddress = '0x...'; // Replace with your deployed factory address

const ScheduleTransaction = () => {
  const [userWallets, setUserWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    to: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

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

  const scheduleTransaction = async () => {
    if (!selectedWallet || !newTransaction.to || !newTransaction.amount) return;
    try {
      await writeContractAsync({
        address: selectedWallet as Address,
        abi: OrbitWalletABI,
        functionName: "submitTransaction",
        args: [
          newTransaction.to,
          parseUnits(newTransaction.amount, 18),
          new Date(newTransaction.date).getTime()
        ],
      });
      setNewTransaction({ to: '', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error scheduling transaction:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Schedule Transaction</h2>
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
      <input
        type="text"
        value={newTransaction.to}
        onChange={(e) => setNewTransaction({...newTransaction, to: e.target.value})}
        placeholder="To address"
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        value={newTransaction.amount}
        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
        placeholder="Amount (BTT)"
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="date"
        value={newTransaction.date}
        onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={scheduleTransaction}
        className="w-full px-4 py-2 bg-green-500 text-white rounded"
      >
        Schedule Transaction
      </button>
    </div>
  );
};

export default ScheduleTransaction;