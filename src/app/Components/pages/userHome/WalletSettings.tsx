'use client';

import { MultisigWallet } from "@/app/types/types";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { Address } from "viem";
import { useWriteContract } from "wagmi";
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import contract from "@/app/utils/ContractAddress.json";
import { Button } from "@/components/ui/button";

const factoryAddress = contract.OrbitFactoryContractAddress;

export default function WalletSettings() {
    const params = useParams<{ address: string }>()
    console.log(params.address)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userWallet, setUserWallet] = useState<MultisigWallet>();
    const [formData, setFormData] = useState({
        signers: [{ name: '', address: "" }],
        threshold: ""
    })
    const { writeContractAsync } = useWriteContract();

    useEffect(() => {
        const fetchWallets = async (wAddress: string) => {
            setLoading(true)
            try {
                const response = await fetch(`/api/wallet/get-by-address?walletAddress=${wAddress}`);
                const data = await response.json();

                if (response.ok) {
                    console.log(data)
                    setUserWallet(data.wallets.length > 0 ? data.wallets[0] : []);
                } else {
                    setError(data.message || 'Failed to fetch wallets');
                }
            } catch (err) {
                setError('An error occurred while fetching wallets');
            } finally {
                setLoading(false);
            }
        };
        if (params.address) { fetchWallets(params.address); }
    }, [params.address])

    const handleDeleteSigner = (index: number) => {
        const newSigners = formData.signers.filter((_, i) => i !== index);
        setFormData({ ...formData, signers: newSigners });
    }
    const handleAddSigner = () => {
        setFormData({
            ...formData,
            signers: [...formData.signers, { name: "", address: '' }]
        })
    }
    // Function to add the owner
    const addOwner = async () => {
        const ownersArray = formData.signers.map(signer => signer.address);
        if (ownersArray.length === 0) return;
        try {
            await writeContractAsync({
                address: factoryAddress as `0x${string}`,
                abi: OrbitWalletABI,
                functionName: 'addOwner',
                args: [ownersArray],
            });
            // Reset the input after successful transaction
            alert('New owner added successfully');
        } catch (error) {
            console.error('Error adding owner:', error);
        }
    };

    // Function to update the threshold
    const updateThreshold = async () => {
        if (formData.threshold === null) return;
        try {
            await writeContractAsync({
                address: factoryAddress as `0x${string}`,
                abi: OrbitWalletABI,
                functionName: 'updateThreshold',
                args: [formData.threshold],
            });
            // Reset input
            alert('Threshold updated successfully');
        } catch (error) {
            console.error('Error updating threshold:', error);
        }
    };
    return (<>
        <div className="flex flex-col gap-10">
            <div className="bg-dark-gray  rounded-lg overflow-hidden ">
                <div className="flex">
                    <div className="h-1 flex-1 bg-accent"></div>
                </div>

                <div className="p-4 px-6 space-y-6 pt-6">
                    <h1 className="text-2xl font-semibold border-b border-border-light pb-4">Current Signers</h1>
                    <div>
                        <div className='flex flex-col space-y-4 pb-8 border-b border-border-light'>
                            {userWallet && userWallet.signerWithName.length > 0 ? userWallet.signerWithName.map((signer) => {
                                return (
                                    <div className='flex items-center gap-2'>
                                        <Blockies
                                            className="table-user-gradient rounded-full"
                                            seed={signer.address}
                                            size={10}
                                            scale={4}

                                        />
                                        <div className="flex flex-col">
                                            <span>{signer.name}</span>
                                            <span>{signer.address}</span>
                                        </div>
                                    </div>)
                            }) : null}
                        </div>


                        <div className='p-6 border-b border-border-light px-0'>
                            <div className="space-y-8">
                                {formData.signers.length > 0 && formData.signers.map((signer, index) => (
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
                                <button onClick={handleAddSigner} className="text-accent">+ Add new signer input</button>
                            </div>
                        </div>
                        <div className="py-4 text-right">
                            <Button className="bg-accent text-black font-bold" onClick={handleAddSigner}>Save New Signer</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-dark-gray  rounded-lg overflow-hidden ">
                <div className="flex">
                    <div className="h-1 flex-1 bg-accent"></div>
                </div>
                <div className="p-4 px-6 space-y-6 pt-6">
                    <h1 className="text-2xl font-semibold border-b border-border-light pb-4">Current Threshold</h1>
                    <div className="flex justify-start">
                        <span className="text-gray-400  w-1/4">Threshold</span>
                        <span>{userWallet?.requiredSignatures} out of {userWallet?.signerAddresses.length} signer(s)</span>
                    </div>


                    <div className="flex space-x-2 items-end p-4 px-0 space-y-6 py-6 border-b border-border-light">
                        <div className=''>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-1">Update Threshold</label>
                            <input
                                type="text"
                                value={formData.threshold}
                                onChange={(e) => {
                                    setFormData({ ...formData, threshold: e.target.value })
                                }}

                                className=" bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                                placeholder="Enter Threshold"
                            />
                        </div>
                    </div>
                    <div className="py-4 text-right">
                        <Button className="bg-accent text-black font-bold" onClick={updateThreshold}>Update Threshold</Button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}