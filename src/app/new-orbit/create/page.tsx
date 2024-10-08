'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, Info, ArrowLeft, Orbit, Trash2 } from 'lucide-react'
import Blockies from "react-blockies";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Address, getContract } from 'viem';
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import contract from "@/app/utils/ContractAddress.json"

import { truncateAddress } from '@/app/utils/truncateAddress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/app/utils/config';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';

const factoryAddress = contract.OrbitFactoryContractAddress;

export default function CreateAccount() {
    const router = useRouter()
    const { address } = useAccount()
    const { writeContractAsync } = useWriteContract();
    const [creatingWalletLoading, setCreatingWalletLoading] = useState<boolean>(false);
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        network: 'BTTC',
        signers: [{ name: '', address: address as `0x${string}` | "" }],
        threshold: 1
    })

    useEffect(() => {
        if (address) {
            setFormData({
                name: '',
                network: 'BTTC',
                signers: [{ name: '', address: address as `0x${string}` }],
                threshold: 1
            })
        }
    }, [address])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNetworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, network: e.target.value })
    }

    const handleAddSigner = () => {
        setFormData({
            ...formData,
            signers: [...formData.signers, { name: "", address: '' }]
        })
    }

    const handleDeleteSigner = (index: number) => {
        const newSigners = formData.signers.filter((_, i) => i !== index);
        setFormData({ ...formData, signers: newSigners });
    }

    const renderStep = () => {
        switch (step) {
        case 1:
            return (
                <>
                    <div className='flex items-center justify-start gap-4 border-b border-border-light mb-8'>

                        <div className="bg-accent text-black text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                            {step}
                        </div>

                        <div className='flex-1 flex flex-col'>
                            <span className="text-xl font-bold">Select network and name of your Safe Account</span>
                            <span className="text-gray-400 text-md mb-4">Select the network on which to create your Safe Account</span>
                        </div>
                    </div>
                    <div className='pb-6 border-b border-border-light px-8'>
                        <div className="space-y-4 my-6 ">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder='Enter name'
                                    className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label htmlFor="network" className="block text-sm font-medium text-gray-400 mb-1">Network</label>
                                <input
                                    type="text"
                                    id="network"
                                    name="name"
                                    disabled
                                    value={formData.network}
                                    onChange={handleNetworkChange}
                                    placeholder='Enter Network'
                                    className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-400">
                            By continuing, you agree to our <a href="#" className="text-accent">terms of use</a> and <a href="#" className="text-accent">privacy policy</a>.
                        </p>
                    </div>
                </>
            )
        case 2:
            return (
                <>
                    <div className='flex items-center justify-start gap-4 border-b border-border-light mb-8'>

                        <div className="bg-accent text-black text-xs font-semibold rounded-full w-5 h-5 flex flex-col items-center justify-center">
                            {step}
                        </div>

                        <div className='flex-1 flex flex-col'>
                            <span className="text-xl font-bold">Signers and confirmations</span>
                            <span className="text-gray-400 text-md mb-4">Set the signer wallets of your Safe Account and how many need to confirm to execute a valid transaction.</span>
                        </div>
                    </div>
                    <div className='pb-6 border-b border-border-light px-8'>
                        <div className="space-y-8">
                            {formData.signers.map((signer, index) => (
                                <div key={index} className="flex space-x-2 items-end">
                                    <div className='w-1/3'>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-1">Signer Name</label>
                                        <input
                                            type="text"
                                            value={signer.name}
                                            onChange={(e) => {
                                                const newSigners = [...formData.signers]
                                                newSigners[index].name = e.target.value
                                                setFormData({ ...formData, signers: newSigners })
                                            }}

                                            className=" bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                                            placeholder={"Signer " + (index + 1)}
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-1">Signer</label>
                                        <input
                                            type="text"
                                            value={signer.address}
                                            onChange={(e) => {
                                                const newSigners = [...formData.signers]
                                                newSigners[index].address = e.target.value as Address
                                                setFormData({ ...formData, signers: newSigners })
                                            }}

                                            className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                                            placeholder="Signer address"
                                        />
                                    </div>

                                    {index > 0 ? <button
                                        onClick={() => handleDeleteSigner(index)}
                                        className="p-4 bg-[#2a2a2a] rounded-md text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                                        aria-label="Delete signer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button> :
                                        <button
                                            onClick={() => handleDeleteSigner(index)}
                                            className="opacity-0 p-4 bg-[#2a2a2a] rounded-md text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                                            aria-label="Delete signer"
                                            disabled
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>}
                                </div>
                            ))}
                            <button onClick={handleAddSigner} className="text-accent">+ Add new signer</button>
                        </div>
                    </div>
                    <div className='pb-6 border-b border-border-light px-8 '>
                        <div className="mt-4 space-y-4">
                            <h3 className="text-lg font-semibold mb-2">Threshold <Info className="inline-block w-4 h-4 text-gray-400" /></h3>
                            <p className="text-gray-400 mb-2">Any transaction requires the confirmation of:</p>

                            <div className='flex items-center gap-2'>
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, threshold: parseInt(value) })}
                                    defaultValue={formData.threshold.toString()}>
                                    <SelectTrigger className="max-w-max">
                                        <SelectValue placeholder="Select Time" />
                                    </SelectTrigger>
                                    <SelectContent className='bg-dark-gray'>
                                        {[...Array(formData.signers.length)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()} className='bg-dark-gray text-accent'>{i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="ml-2 text-gray-400">out of {formData.signers.length} signer(s)</span>
                            </div>
                        </div>
                    </div>
                </>
            )
        case 3:
            return (
                <>
                    <div className='flex items-center justify-start gap-4 border-b border-border-light mb-8'>

                        <div className="bg-accent text-black text-xs font-semibold rounded-full w-5 h-5 flex flex-col items-center justify-center">
                            {step}
                        </div>

                        <div className='flex-1 flex flex-col'>
                            <span className="text-xl font-bold">Review</span>
                            <span className="text-gray-400 text-md mb-4">You're about to create a new Orbit Account and will have to confirm the transaction with your connected wallet..</span>
                        </div>
                    </div>
                    <div className='pb-6 border-b border-border-light px-8'>
                        <div className="space-y-6 mb-4">
                            <div className="flex justify-start">
                                <span className="text-gray-400 w-1/4">Network</span>
                                <span>{formData.network}</span>
                            </div>
                            <div className="flex justify-start">
                                <span className="text-gray-400  w-1/4">Name</span>
                                <span>{formData.name}</span>
                            </div>
                            <div className="flex justify-start">
                                <span className="text-gray-400  w-1/4">Signers</span>
                                <div className='flex flex-col items-center space-y-4'>
                                    {formData.signers.length > 0 ? formData.signers.map((signer) => {
                                        return (
                                            <div className='flex items-center gap-2'>
                                                <Blockies
                                                    className="table-user-gradient rounded-full"
                                                    seed={signer.address}
                                                    size={10}
                                                    scale={4}

                                                />{signer.address}
                                            </div>)
                                    }) : null}
                                </div>

                            </div>
                            <div className="flex justify-start">
                                <span className="text-gray-400  w-1/4">Threshold</span>
                                <span>{formData.threshold} out of {formData.signers.length} signer(s)</span>
                            </div>
                        </div>
                    </div>
                    <div className='pb-6 border-b border-border-light px-8'>
                        <div className='space-y-4 pt-6'>
                            <h3 className="font-semibold mb-2">Before you continue</h3>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-accent mr-2 mt-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-gray-400">There will be a one-time network fee to activate your smart account wallet on the mainnet.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-accent mr-2 mt-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-gray-400">For the testnet, this activation fee will be covered by the platform.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className='pb-6 border-b border-border-light px-8'>
                        <div className="space-y-6 mb-4 pt-6">
                            <div className="flex justify-start">
                                <span className="text-gray-400 w-1/4">Est. network fee</span>
                                <div className='flex flex-col'>
                                    <span className='bg-accent-light p-2 font-bold text-white rounded-lg max-w-max'>≈ 0.0728 {formData.network}</span>
                                    <p className='text-gray-500 mt-4 text-sm'>You will have to confirm a transaction with your connected wallet.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </>
            )
        default:
            return null
        }
    }

    const handleCreateOrbitMultisig = async () => {
        setCreatingWalletLoading(true)
        const ownersArray = formData.signers.map(signer => signer.address);
        // console.log(address.toLowerCase());
        // ownersArray.push(address.toLowerCase());
        try {
            const tx = await writeContractAsync({
                address: factoryAddress as Address,
                abi: OrbitWalletFactoryABI,
                functionName: "createWallet",
                args: [ownersArray, formData.threshold],
            });
            let walletAddress;
            // Wait for the transaction to be confirmed
            const receipt = await waitForTransactionReceipt(config as any, {
                hash: tx,
            });
            console.log(receipt)
            // Topic for the WalletCreated event (hash of the event signature)
            const eventTopic = ethers.id("WalletCreated(address,address[],uint256)");
            console.log(eventTopic)
            // Find the event log that matches the WalletCreated event
            const event = receipt.logs.find(log => log.topics[0] === eventTopic);
            console.log(event)
            if (event) {
                console.log("inside of event")
                // Decode the event data to extract the wallet address
                // Decode the indexed wallet address from topics[1]
                walletAddress = ethers.getAddress(`0x${(event.topics[1])?.slice(-40)}`);

                console.log('Created Wallet Address:', walletAddress);
                console.log('Created Wallet Address:', walletAddress);
            } else {
                console.error('WalletCreated event not found in the logs.');
            }
            const data = {
                walletAddress: walletAddress,
                name: formData.name,
                signerWithName: formData.signers, // Array of signerName and signer (address)
                createdBy: address,
                requiredSignatures: formData.threshold
            }
            const response = await fetch('/api/wallet/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Multisig wallet created: ${result.id}`);
                router.push('/welcome/accounts');
            } else {
                alert(`Error: ${result.message}`);
            }

        } catch (error) {
            console.error('Error creating wallet:', error);
        }
        finally {
            setCreatingWalletLoading(false)
        }
    }

    return (
        <>
            <div className="min-h-screen bg-[#121212] text-white p-8 font-dmsans">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Create new Orbit Account</h1>

                    <div className="flex space-x-8 ">
                        <div className="flex-1 bg-[#1c1c1c] rounded-lg overflow-hidden">
                            <div className="flex">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className={`h-1 flex-1 ${s <= step ? 'bg-accent' : 'bg-border-light'}`}></div>
                                ))}
                            </div>
                            <div className="mb-8 p-6 ">
                                {renderStep()}
                            </div>
                            <div className="flex justify-between px-12 pb-6">
                                {step > 1 && (
                                    <button onClick={() => setStep(step - 1)} className="flex items-center font-bold text-sm text-accent border border-accent py-2 px-12 rounded-md">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button onClick={() => setStep(step + 1)} className="ml-auto font-bold text-sm bg-accent text-black py-2 px-12 rounded-md">
                                        Next
                                    </button>
                                ) : (
                                    <button className="ml-auto  font-bold text-sm bg-accent text-black py-2 px-12 rounded-md" onClick={handleCreateOrbitMultisig}>
                                        Create
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="w-80">
                            <div className="bg-[#1c1c1c] rounded-md flex flex-col items-center border border-border-light">
                                <div className='flex flex-col items-center justify-center border-b border-border-light p-6 pb-2'>
                                    <Orbit className='w-6 h-6 mb-4' />
                                    <h2 className="text-xl font-semibold mb-4">Your Orbit Account preview</h2>
                                </div>
                                <div className="w-full ">
                                    <div className="flex justify-between border-b border-border-light p-6 py-4">
                                        <span className="text-gray-400">Wallet</span>
                                        <div className='flex items-center gap-2'>
                                            <Blockies
                                                className="table-user-gradient rounded-full"
                                                seed={
                                                    "something can be added here"
                                                }
                                                size={10}
                                                scale={3}
                                            />
                                            <span>{truncateAddress(address as Address)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b border-border-light p-6 py-4">
                                        <span className="text-gray-400">Network</span>
                                        <span>{formData.network}</span>
                                    </div>
                                    {formData.name ? <div className="flex justify-between border-b border-border-light p-6 py-4">
                                        <span className="text-gray-400">Name</span>
                                        <span>{formData.name}</span>
                                    </div> : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}