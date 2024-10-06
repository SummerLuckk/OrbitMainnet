import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from '../utils/publicClient';
import contract from "../utils/ContractAddress.json"
import { useRouter } from 'next/navigation';

const factoryAddress = contract.OrbitFactoryContractAddress;

const CreateWallet = () => {
  const [userWallets, setUserWallets] = useState([]);
  const [newOwners, setNewOwners] = useState('');
  const [requiredConfirmations, setRequiredConfirmations] = useState(2);

  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();

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
    const ownersArray = newOwners.split(',').map(addr => addr.trim().toLowerCase());
    console.log(address.toLowerCase());
    ownersArray.push(address.toLowerCase()); // Include the current user
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

  const handleWalletClick = (wallet: string) => {
    // Redirect to a page based on the wallet address
    router.push(`/user-wallet/${wallet}`);
  };

  return (
    <div className="container mx-auto p-6" style={{ color: 'black' }}>

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
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Create Wallet
        </button>
      </div>

      <h3 className="text-xl font-bold mb-2">Your Wallets</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userWallets.map((wallet, index) => (
          <div
            key={index}
            onClick={() => handleWalletClick(wallet)}
            className="p-4 border rounded shadow-lg hover:shadow-xl transition duration-200 cursor-pointer" style={{color :"white"}}
          >
            <h4 className="font-semibold text-lg">Wallet Address</h4>
            <p className="text-gray-700 break-all">{wallet}</p>
          </div>
        ))}
        {userWallets.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 text-center text-gray-500">
            No wallets created yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWallet;
