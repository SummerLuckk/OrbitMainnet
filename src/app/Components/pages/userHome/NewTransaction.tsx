'use client'

import { MultisigWallet, TokenDetails } from "@/app/types/types";
import { useEffect, useState } from "react";
import { getContract, Address, Client } from "viem";
import { getChainId } from '@wagmi/core';
import { config } from "@/app/utils/config";
import { parseUnits, keccak256, toUtf8Bytes } from 'ethers';
import contract from "@/app/utils/ContractAddress.json";
import { useAccount, useWriteContract } from "wagmi";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import { initializeClient } from "@/app/utils/publicClient";
import { getTokenDetails } from "@/app/utils/getToken";
import * as Switch from '@radix-ui/react-switch';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const factoryAddress = contract.OrbitFactoryContractAddress;
interface NewTransactionProps {
    date?: Date
}

export default function NewTransaction({ date }: NewTransactionProps) {
    const params = useParams<{ address: string }>()
    console.log(params.address)
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState('');
    // const [userWallet, setUserWallet] = useState<MultisigWallet>();
    
    const WalletContractAddress = params.address;
    console.log(date)
    const [newTransaction, setNewTransaction] = useState({
        to: '',
        amount: '',
        tokenAddress: '',
        date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        client: client as Client,
    });

    const loadTokenDetails = async () => {
        if (newTransaction.tokenAddress && address) {
            console.log(address)
            const details = await getTokenDetails(newTransaction.tokenAddress, address);
            setTokenDetails(details);
        }
    };
    useEffect(() => {
        console.log("called", isERC20, newTransaction.tokenAddress)
        if (isERC20 && newTransaction.tokenAddress && address) {
            console.log("called inside")

            loadTokenDetails();
        }
    }, [isERC20, newTransaction.tokenAddress, address]);

    // useEffect(() => {
    //     const fetchWallets = async (wAddress: string) => {
    //         setLoading(true)
    //         try {
    //             const response = await fetch(`/api/wallet/get-by-address?walletAddress=${wAddress}`);
    //             const data = await response.json();

    //             if (response.ok) {
    //                 console.log(data)
    //                 setUserWallet(data.wallets.length > 0 ? data.wallets : []);
    //             } else {
    //                 setError(data.message || 'Failed to fetch wallets');
    //             }
    //         } catch (err) {
    //             setError('An error occurred while fetching wallets');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     if (params.address) { fetchWallets(params.address); }
    // }, [params.address])

    const scheduleTransaction = async () => {
        if (!WalletContractAddress || !newTransaction.to || !newTransaction.amount) return;

        try {
            const timestamp = new Date().getTime().toString();
            const combined = toUtf8Bytes(`${address}-${timestamp}`);
            const nonce = keccak256(combined);

            const tokenAddress = isERC20 ? newTransaction.tokenAddress : "0x0000000000000000000000000000000000000000";
            const amount = parseUnits(newTransaction.amount, isERC20 ? Number(tokenDetails?.decimals) : 18);
            console.log("nonce", nonce, new Date(newTransaction.date).getTime())
            console.log(WalletContractAddress);

            console.log( newTransaction.to,
                amount,
                tokenAddress,
                nonce,
                new Date(newTransaction.date).getTime(),)
            const tx = await writeContractAsync({
                address: WalletContractAddress as Address,
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

            const response = await fetch('/api/transactions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: WalletContractAddress,
                    txHash: tx,
                    createdBy: address,
                    scheduledTime: new Date().toISOString(), // Set the scheduled time for the transaction
                }),
            });

            const result = await response.json();
            console.log(result);

            setNewTransaction({ to: '', amount: '', tokenAddress: '', date: new Date().toISOString().split('T')[0] });
            setIsERC20(false);
            setTokenDetails(null);
        } catch (error) {
            console.error('Error scheduling transaction:', error);
        }
    };

    return (<>
        <div className="bg-dark-gray  rounded-lg overflow-hidden ">
            <div className="flex">
                <div className="h-1 flex-1 bg-accent"></div>
            </div>
            <div className="p-4 px-6 space-y-6 pt-6">

                <div className="mb-4 flex items-center gap-2 pt-8">

                    <Switch.Root
                        className="relative w-[42px] h-[25px] rounded-full bg-black/90 shadow-md focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-150 ease-in-out"
                        id="erc20-mode"
                        checked={isERC20}
                        onCheckedChange={setIsERC20}>
                        <Switch.Thumb
                            className={`block w-[21px] h-[21px] ${isERC20 ? "bg-accent" : "bg-white"} rounded-full shadow-md transform transition-transform duration-100 ease-in-out will-change-transform`}
                            style={{ transform: isERC20 ? 'translateX(19px)' : 'translateX(2px)' }}
                        />
                    </Switch.Root>
                    <Label htmlFor="erc20-mode">ERC20 Token Transfer</Label>
                </div>

                {isERC20 && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Token Address</label>
                        <input
                            type="text"
                            value={newTransaction.tokenAddress}
                            onChange={(e) => setNewTransaction({ ...newTransaction, tokenAddress: e.target.value })}
                            placeholder="Token Address"
                            className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"

                        />
                    </div>
                )}

                {tokenDetails && (
                    <div className="mb-2">
                        <p>Token: {tokenDetails.name} ({tokenDetails.symbol})</p>
                        <p>Balance: {parseFloat(tokenDetails.balance.toString()) / Math.pow(10, Number(tokenDetails.decimals))}</p>
                    </div>
                )}


                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Receiver's Address</label>
                    <input
                        type="text"
                        value={newTransaction.to}
                        onChange={(e) => setNewTransaction({ ...newTransaction, to: e.target.value })}
                        placeholder="Receiver's address"
                        className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"

                    />
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                    <input
                        type="text"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        placeholder={`Amount (${isERC20 ? tokenDetails?.symbol || 'Tokens' : 'BTT'})`}
                        className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"

                    />
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                    <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"

                    />
                </div>

                <Button
                    onClick={scheduleTransaction}
                    className="w-full px-4 py-2 bg-accent text-black rounded-lg"
                >
                    Schedule Transaction
                </Button>
            </div>
        </div>
    </>)
}