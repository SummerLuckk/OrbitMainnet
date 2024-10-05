import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from '../utils/publicClient';

const factoryAddress = '0x...'; // Replace with your deployed factory address

const CreateWallet = () => {
  const [userWallets, setUserWallets] = useState([]);
  const [newOwners, setNewOwners] = useState('');
  const [requiredConfirmations, setRequiredConfirmations] = useState(2);

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

  const createWallet = async () => {
    const ownersArray = newOwners.split(',').map(addr => addr.trim());
    ownersArray.push(address); // Include the current user
    try {
      await writeContractAsync({
        address: factoryAddress as Address,
        abi: OrbitWalletFactoryABI,
        functionName: "createWallet",
        args: [ownersArray, requiredConfirmations],
      });
      getUserWallets();
      setNewOwners('');
      setRequiredConfirmations(2);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create New Wallet</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newOwners}
          onChange={(e) => setNewOwners(e.target.value)}
          placeholder="Owner addresses (comma-separated)"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="number"
          value={requiredConfirmations}
          onChange={(e) => setRequiredConfirmations(Number(e.target.value))}
          min="2"
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={createWallet}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Wallet
        </button>
      </div>
      <h3 className="text-xl font-bold mb-2">Your Wallets</h3>
      <ul>
        {userWallets.map((wallet, index) => (
          <li key={index} className="mb-2">{wallet}</li>
        ))}
      </ul>
    </div>
  );
};

export default CreateWallet;