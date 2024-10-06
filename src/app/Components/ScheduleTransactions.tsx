import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from '../utils/publicClient';
import { parseUnits, keccak256, toUtf8Bytes } from 'ethers';
import contract from "../utils/ContractAddress.json";
import { getTokenDetails } from '../utils/getToken'; // Import the getTokenDetails function

const factoryAddress = contract.OrbitFactoryContractAddress;

interface ScheduleTransactionProps {
  contractAddress: Address;
}

interface TokenDetails {
  name: string;
  symbol: string;
  decimals: string;
  balance: bigint;
}

const ScheduleTransaction: React.FC<ScheduleTransactionProps> = ({ contractAddress }) => {
  const [userWallets, setUserWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    to: '',
    amount: '',
    tokenAddress: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isERC20, setIsERC20] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);

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

  useEffect(() => {
    console.log("called",isERC20,newTransaction.tokenAddress)
    if (isERC20 && newTransaction.tokenAddress && address) {
    console.log("called inside")

      loadTokenDetails();
    }
  }, [isERC20, newTransaction.tokenAddress, address]);

  const getUserWallets = async () => {
    try {
      const wallets = await factoryContract.read.getUserWallets([address]);
      setUserWallets(wallets);
    } catch (error) {
      console.error('Error fetching user wallets:', error);
    }
  };

  const loadTokenDetails = async () => {
    if (newTransaction.tokenAddress && address) {
      console.log(address)
      const details = await getTokenDetails(newTransaction.tokenAddress, address);
      setTokenDetails(details);
    }
  };

  const scheduleTransaction = async () => {
    if (!contractAddress || !newTransaction.to || !newTransaction.amount) return;

    try {
      const timestamp = new Date().getTime().toString();
      const combined = toUtf8Bytes(`${address}-${timestamp}`);
      const nonce = keccak256(combined);

      const tokenAddress = isERC20 ? newTransaction.tokenAddress : "0x0000000000000000000000000000000000000000";
      const amount = parseUnits(newTransaction.amount, isERC20 ? Number(tokenDetails?.decimals) : 18);

      await writeContractAsync({
        address: contractAddress as Address,
        abi: OrbitWalletABI,
        functionName: "submitTransaction",
        args: [
          newTransaction.to,
          amount,
          tokenAddress,
          nonce,
          new Date(newTransaction.date).getTime(),
        ],
      });
      setNewTransaction({ to: '', amount: '', tokenAddress: '', date: new Date().toISOString().split('T')[0] });
      setIsERC20(false);
      setTokenDetails(null);
    } catch (error) {
      console.error('Error scheduling transaction:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Schedule Transaction</h2>
      
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isERC20}
            onChange={(e) => setIsERC20(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2">ERC20 Token Transfer</span>
        </label>
      </div>

      {isERC20 && (
        <input
          type="text"
          value={newTransaction.tokenAddress}
          onChange={(e) => setNewTransaction({...newTransaction, tokenAddress: e.target.value})}
          placeholder="Token Address"
          className="w-full p-2 border rounded mb-2"
        />
      )}

      {tokenDetails && (
        <div className="mb-2">
          <p>Token: {tokenDetails.name} ({tokenDetails.symbol})</p>
          <p>Balance: {parseFloat(tokenDetails.balance.toString()) / Math.pow(10, Number(tokenDetails.decimals))}</p>
        </div>
      )}

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
        placeholder={`Amount (${isERC20 ? tokenDetails?.symbol || 'Tokens' : 'BTT'})`}
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