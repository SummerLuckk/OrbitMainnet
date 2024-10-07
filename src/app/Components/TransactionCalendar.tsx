import React, { useState, useEffect } from 'react';
import { getContract, Address, createWalletClient, custom, formatUnits } from "viem";
import { getChainId } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import { initializeClient } from '../utils/publicClient';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import contract from "../utils/ContractAddress.json";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  contractAddress: Address; 
}

const TransactionCalendar: React.FC<TransactionCalendarProps> = ({ contractAddress }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [signatures, setSignatures] = useState<string[]>([]);

  const chainId = getChainId(config);
  const client = initializeClient(chainId);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const getWalletTransactions = async (walletAddress: Address) => {
    const walletContract = getContract({
      address: walletAddress,
      abi: OrbitWalletABI,
      client: client,
    });

    try {
      const transactionsData: Transaction[] = await walletContract.read.getAllTransactions();
      setTransactions(transactionsData);
      const thresholdValue = await walletContract.read.numConfirmationsRequired();
      setThreshold(Number(thresholdValue));
    } catch (error) {
      console.error('Error fetching transactions or threshold:', error);
    }
  };

  const fetchSignatures = async (txIndex: number) => {
    try {
      const response = await fetch(`/api/manage-signature?walletAddress=${contractAddress}&txIndex=${txIndex}`);
      const data = await response.json();
      setSignatures(data.signatures.map((s: any) => s.signature));
    } catch (error) {
      console.error('Error fetching signatures:', error);
    }
  };

  useEffect(() => {
    if (contractAddress) {
      getWalletTransactions(contractAddress);
    }
  }, [contractAddress]);

  useEffect(() => {
    if (selectedTransaction) {
      fetchSignatures(selectedTransaction.txIndex);
    }
  }, [selectedTransaction]);

  const handleEventClick = (event: any) => {
    const transaction = transactions.find(tx => formatUnits(tx.amount, 18) === event.title.split(' ')[0]);
    setSelectedTransaction(transaction || null);
    setShowModal(true);
  };

  const getEventStyle = (tx: Transaction) => {
    const transactionDate = new Date(Number(tx.date));
    const currentDate = new Date();
  
    // Check if the transaction date is the same as today
    const isSameDay = transactionDate.toDateString() === currentDate.toDateString();
  
    if (tx.executed) {
      return { backgroundColor: '#4caf50', color: 'white' }; // Green for executed
    }
  
    if (isSameDay) {
      return { backgroundColor: '#ffeb3b', color: 'black' }; // Yellow for same-day transactions
    }
  
    if (tx.date < Date.now() && !tx.executed) {
      return { backgroundColor: '#f44336', color: 'white' }; // Red for missed transactions
    }
  
    return { backgroundColor: '#ffeb3b', color: 'black' }; // Yellow for upcoming transactions
  };
  
  const calendarEvents = transactions.map(tx => ({
    title: `${formatUnits(tx.amount, 18)} BTT to ${tx.receiver}`,
    start: new Date(Number(tx.date)),
    end: new Date(Number(tx.date)),
    allDay: true,
    style: getEventStyle(tx),
  }));

  const signTransaction = async (transaction: Transaction) => {

    console.log(transaction)
    try {
      const client = createWalletClient({
        chain: {
          id: 1029,
          rpcUrls: {
            public: "https://pre-rpc.bittorrentchain.io/",
          },
        },
        transport: custom(window.ethereum),
      });

      const signature = await client.signTypedData({
        account: address as Address,
        domain: {
          name: "OrbitWallet",
          version: "1",
          chainId: "1029",
          verifyingContract: contractAddress,
        },
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          signTransaction: [
            { name: "receiver", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "tokenAddress", type: "address" },
            { name: "nonce", type: "bytes32" },
            { name: "date", type: "uint256" },
          ],
        },
        primaryType: "signTransaction",
        message: {
          receiver: transaction.receiver,
          amount: transaction.amount,
          tokenAddress: transaction.tokenAddress,
          nonce: transaction.nonce,
          date: transaction.date.toString(),
        },
      });

      console.log(signature);

      // Store the signature
      await fetch('/api/manage-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: contractAddress,
          txIndex: transaction.txIndex.toString(),
          signature,
          signerAddress: address,
        }),
      });

      // Refresh signatures
      console.log("done")
      await fetchSignatures(transaction.txIndex);

    } catch (err) {
      console.error("Error signing transaction:", err);
    }
  };

  const executeTransaction = async (transaction: Transaction) => {
    await writeContractAsync({
      address: contractAddress as Address,
      abi: OrbitWalletABI,
      functionName: "executeScheduledTransaction",
      args: [
        transaction.txIndex,
        signatures
      ],
      value: transaction.amount
    });
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction Calendar</h2>

      <div className="mb-4 flex space-x-8">
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

      <Calendar
        localizer={localizer}
        events={calendarEvents}
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
            borderRadius: '5px',
            padding: '10px',
          },
        })}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <p><strong>Receiver:</strong> {selectedTransaction.receiver}</p>
              <p><strong>Amount:</strong> {formatUnits(selectedTransaction.amount, 18)} BTT</p>
              <p><strong>Status:</strong> {selectedTransaction.executed ? "Executed" : "Pending"}</p>
              <p><strong>Nonce:</strong> {selectedTransaction.nonce}</p>
              <p><strong>Date:</strong> {new Date(Number(selectedTransaction.date)).toLocaleString()}</p>
              <p><strong>Signatures:</strong> {signatures.length} / {threshold}</p>

              {!selectedTransaction.executed && (
                <>
                  <Button 
                    onClick={() => signTransaction(selectedTransaction)} 
                    variant="primary"
                    className="mt-2"
                    disabled={false}
                  >
                    Sign
                  </Button>
                  <Button 
                    onClick={() => executeTransaction(selectedTransaction)} 
                    variant="success"
                    className="mt-2"
                    disabled={signatures.length < threshold || selectedTransaction.executed}
                  >
                    Execute
                  </Button>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransactionCalendar;
