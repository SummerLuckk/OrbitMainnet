import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import { initializeClient } from '../utils/publicClient';
import contract from "../utils/ContractAddress.json";

const factoryAddress = contract.OrbitFactoryContractAddress;

interface SettingsProps {
  members: Address[];  // List of current wallet members (owners)
}

const Settings: React.FC<SettingsProps> = ({ members }) => {
  const [newOwner, setNewOwner] = useState(''); // State to hold new owner address
  const [newThreshold, setNewThreshold] = useState<number | null>(null); // State to hold new threshold value
  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const walletContract = getContract({
    address: factoryAddress as `0x${string}`,
    abi: OrbitWalletABI,
    client: client,
  });

  // Function to add a new owner
  const addOwner = async () => {
    if (!newOwner) return;
    try {
      await writeContractAsync({
        address: factoryAddress as `0x${string}`,
        abi: OrbitWalletABI,
        functionName: 'addOwner',
        args: [newOwner],
      });
      setNewOwner(''); // Reset the input after successful transaction
      alert('New owner added successfully');
    } catch (error) {
      console.error('Error adding owner:', error);
    }
  };

  // Function to update the threshold
  const updateThreshold = async () => {
    if (newThreshold === null) return;
    try {
      await writeContractAsync({
        address: factoryAddress as `0x${string}`,
        abi: OrbitWalletABI,
        functionName: 'updateThreshold',
        args: [newThreshold],
      });
      setNewThreshold(null); // Reset input
      alert('Threshold updated successfully');
    } catch (error) {
      console.error('Error updating threshold:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Settings</h2>
      <p>Manage Owners and Threshold</p>
      
      {/* Display current members */}
      {members ? (
        <ul className="list-disc pl-6 mt-2">
          {members.map((member, index) => (
            <li key={index} className="mt-1">{member}</li>
          ))}
        </ul>
      ) : (
        <p>Loading members...</p>
      )}
      
      {/* Add Owner */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Add New Owner</h3>
        <input
          type="text"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          placeholder="Enter owner address"
          className="border p-2 rounded mt-2"
        />
        <button
          onClick={addOwner}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 ml-4"
        >
          Add Owner
        </button>
      </div>
      
      {/* Update Threshold */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Update Threshold</h3>
        <input
          type="number"
          value={newThreshold ?? ''}
          onChange={(e) => setNewThreshold(Number(e.target.value))}
          placeholder="Enter new threshold"
          className="border p-2 rounded mt-2"
        />
        <button
          onClick={updateThreshold}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2 ml-4"
        >
          Update Threshold
        </button>
      </div>
    </div>
  );
};

export default Settings;
