import React, { useState, useEffect } from 'react';
import { getContract, Address } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from '../utils/publicClient';
import { Calendar, momentLocalizer } from 'react-big-calendar';
const moment = require('moment');
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatUnits } from 'ethers';
import contract from "../utils/ContractAddress.json";

const localizer = momentLocalizer(moment);

const factoryAddress = contract.OrbitFactoryContractAddress;

interface Transaction {
  txIndex: number;
  receiver: string;
  amount: bigint;
  tokenAddress: string;
  executed: boolean;
  nonce: string;
  date: number;
}

interface TransactionCalendarProps {
  contractAddress: Address;  // or Address if you're using the viem type
}

const TransactionCalendar: React.FC<TransactionCalendarProps> = ({ contractAddress }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();

  const factoryContract = getContract({
    address: factoryAddress as `0x${string}`,
    abi: OrbitWalletFactoryABI,
    client: client,
  });

  const getWalletTransactions = async (walletAddress: Address) => {
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
    if (contractAddress) {
      getWalletTransactions(contractAddress as Address);
    }
  }, [contractAddress]);

  const handleEventClick = (event: any) => {
    const transaction = transactions.find(tx => formatUnits(tx.amount, 18) === event.title.split(' ')[0]);
    setSelectedTransaction(transaction || null);
    setShowPopup(true);
  };

  const getEventStyle = (tx: Transaction) => {
    if (tx.executed) return { backgroundColor: 'green', color: 'black' }; // Completed
    if (tx.date < Date.now() && !tx.executed) return { backgroundColor: 'red', color: 'black' }; // Missed
    return { backgroundColor: 'yellow', color: 'black' }; // Upcoming
  };

  const calendarEvents = transactions.map(tx => ({
    title: `${formatUnits(tx.amount, 18)} BTT to ${tx.receiver}`,
    start: new Date(Number(tx.date)),
    end: new Date(Number(tx.date)),
    allDay: true,
    style: getEventStyle(tx), // Adding the style here
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transaction Calendar</h2>

      <div className="mb-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 mr-2"></span> <span>Completed</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 mr-2"></span> <span>Missed</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 mr-2"></span> <span>Upcoming</span>
          </div>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={calendarEvents} // Using the processed events
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleEventClick}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.style.backgroundColor,
            color: event.style.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        })}
      />

      {showPopup && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-bold">Transaction Details</h3>
            <p><strong>Receiver:</strong> {selectedTransaction.receiver}</p>
            <p><strong>Amount:</strong> {formatUnits(selectedTransaction.amount, 18)} BTT</p>
            <p><strong>Status:</strong> {selectedTransaction.executed ? "Executed" : "Pending"}</p>
            <p><strong>Nonce:</strong> {selectedTransaction.nonce}</p>
            <p><strong>Date:</strong> {new Date(Number(selectedTransaction.date)).toLocaleString()}</p>
            <button onClick={() => setShowPopup(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Sign</button>
            <button onClick={() => setShowPopup(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Execute</button>
            <button onClick={() => setShowPopup(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCalendar;
