'use client';

import { MultisigTransaction, MultisigWallet } from "@/app/types/types";
import { CloudCog, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { Address, createWalletClient, custom, keccak256 } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { config } from "@/app/utils/config";
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import contract from "@/app/utils/ContractAddress.json";
import { Button } from "@/components/ui/button";
import { bittorrentchainMainnet } from "@/app/utils/getToken";
import { ethers, toUtf8Bytes } from "ethers";
import WalletUpdateRequests from "./WalletUpdateRequests";

const factoryAddress = contract.OrbitFactoryContractAddress;

export default function WalletSettings() {
    const params = useParams<{ address: string }>()
    console.log(params.address)
    const walletAddress = params.address
    const { address } = useAccount()
    const [loading, setLoading] = useState(false);
    const [addingNewSigner, setAddingNewSigner] = useState<boolean>(false);
    const [thresholdUpdateLoading, setThresholdUpdateLoading] = useState<boolean>(false)
    const [error, setError] = useState('');
    const [userWallet, setUserWallet] = useState<MultisigWallet>();
    const [ownerUpdateTransaction, setOwnerUpdateTransaction] = useState<MultisigTransaction[]>([]);
    const [thresholdUpdateTransaction, setThresholdUpdateTransaction] = useState<MultisigTransaction[]>([]);
    const [errors, setErrors] = useState({
        signers: '',
        threshold: ''
    });

    const [formData, setFormData] = useState({
        signers: [{ name: '', address: "" }],
        threshold: ""
    })

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

        // fetchOwnerAddTransactions()
        if (params.address) { fetchWallets(params.address); fetchOwnerAddTransactions(); }
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


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //for Owner management//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




    // function to fell all request  Transaction for updating owners
    const fetchOwnerAddTransactions = async () => {
        try {

            const response = await fetch(`/api/manage-settings/request?walletAddress=${walletAddress}`)
            const data = await response.json();
            // console.log(data);
            console.log("signer requests :", data)

            setOwnerUpdateTransaction(data.signatures)
            console.log("signatures", data.signatures)

        } catch (error) {
            console.error('Error fetching signatures:', error);
        }
    };


    // function to create Transaction for updating owners
    const createAndsignOwnerAddTransaction = async () => {
        setAddingNewSigner(true)
        try {
            let errorMessages = { signers: '', threshold: '' };
            // Check for minimum 2 signers with valid addresses

            if (!formData.signers[0].address) {
                errorMessages.signers = "Please enter a valid signer address.";
            }

            if (errorMessages.signers) {
                setErrors(errorMessages);
                return; // Prevent moving to the next step if there are errors
            }
            // Clear any previous errors if validation passes
            setErrors({ signers: '', threshold: '' });

            const abi = [
                "function addOwner(address _address)"
            ];
            const iface = new ethers.Interface(abi);


            const addressToAdd = formData.signers[0].address;

            const calldata = iface.encodeFunctionData("addOwner", [addressToAdd]) as `0x${string}`;
            const timestamp = new Date().getTime().toString();
            const combined = toUtf8Bytes(`${address}-${timestamp}`);
            const nonce = keccak256(combined);
            const deadline: bigint = BigInt(Date.now() + 24 * 60 * 60 * 1000);

            if (typeof window !== undefined && window.ethereum) {
                const client = createWalletClient({
                    chain: bittorrentchainMainnet,
                    transport: custom(window.ethereum),
                });
                const signature = await client?.signTypedData({
                    account: address as Address,
                    domain: {
                        name: "OrbitWallet",
                        version: "1",
                        chainId: BigInt(199),
                        verifyingContract: walletAddress as Address,
                    },
                    types: {
                        EIP712Domain: [
                            { name: "name", type: "string" },
                            { name: "version", type: "string" },
                            { name: "chainId", type: "uint256" },
                            { name: "verifyingContract", type: "address" },
                        ],
                        Execute: [
                            { name: "to", type: "address" },
                            { name: "value", type: "uint256" },
                            { name: "data", type: "bytes" },
                            { name: "nonce", type: "uint256" },
                            { name: "deadline", type: "uint256" },
                        ],
                    },
                    primaryType: "Execute",
                    message: {
                        to: walletAddress as Address,
                        value: BigInt(0),
                        data: calldata,
                        nonce: BigInt(nonce),
                        deadline: deadline,
                    },
                });
                // console.log(signature);
                // Store the signature
                await fetch('/api/manage-settings/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: walletAddress,
                        data: calldata,
                        nonce: nonce,
                        deadline: deadline.toString(),
                        threshold: 0,
                        newOwner: addressToAdd,
                        name: formData.signers[0].name,
                        signerAddress: address,
                        signature: signature,
                        status: "active",
                        transactionType: "owner"
                    }),
                });
                // Refresh signatures
                console.log("done")
                // await fetchSignatures(transaction.txIndex);
            }
        } catch (err) {
            console.error("Error signing transaction:", err);
        }
        finally {
            setAddingNewSigner(false)
        }
    };



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //for threshold management//
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const createAndsignThresholdTransaction = async () => {
        setThresholdUpdateLoading(true)

        const abi = [
            "function changeThreshold(uint256 _value)"
        ];
        const iface = new ethers.Interface(abi);


        const threshold = formData.threshold;

        const calldata = iface.encodeFunctionData("changeThreshold", [threshold]) as `0x${string}`;
        const timestamp = new Date().getTime().toString();
        const combined = toUtf8Bytes(`${address}-${timestamp}`);
        const nonce = keccak256(combined);
        const deadline: bigint = BigInt(Date.now() + 24 * 60 * 60 * 1000);

        try {

            if (typeof window !== undefined && window.ethereum) {
                const client = createWalletClient({
                    chain: bittorrentchainMainnet,
                    transport: custom(window.ethereum),
                });
                const signature = await client?.signTypedData({
                    account: address as Address,
                    domain: {
                        name: "OrbitWallet",
                        version: "1",
                        chainId: BigInt(199),
                        verifyingContract: walletAddress as Address,
                    },
                    types: {
                        EIP712Domain: [
                            { name: "name", type: "string" },
                            { name: "version", type: "string" },
                            { name: "chainId", type: "uint256" },
                            { name: "verifyingContract", type: "address" },
                        ],
                        Execute: [
                            { name: "to", type: "address" },
                            { name: "value", type: "uint256" },
                            { name: "data", type: "bytes" },
                            { name: "nonce", type: "uint256" },
                            { name: "deadline", type: "uint256" },
                        ],
                    },
                    primaryType: "Execute",
                    message: {
                        to: walletAddress as Address,
                        value: BigInt(0),
                        data: calldata,
                        nonce: BigInt(nonce),
                        deadline: deadline,
                    },
                });
                // console.log(signature);
                // Store the signature
                await fetch('/api/manage-settings/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: walletAddress,
                        data: calldata,
                        nonce: nonce,
                        deadline: deadline.toString(),
                        threshold: threshold,
                        newOwner: "",
                        name: "",
                        signerAddress: address,
                        signature: signature,
                        status: "active",
                        transactionType: "threshold"
                    }),
                });
                // Refresh signatures
                console.log("done")
                // await fetchSignatures(transaction.txIndex);
            }
        } catch (err) {
            console.error("Error signing transaction:", err);
        }
        finally {
            setThresholdUpdateLoading(false)
        }
    };




    return (<>
        <div className="flex flex-col gap-10">

            {ownerUpdateTransaction &&
                ownerUpdateTransaction.length > 0 ?
                <WalletUpdateRequests transactions={ownerUpdateTransaction} userWallet={userWallet} />
                : null}

            {/* update signer */}
            <div className="bg-dark-gray  rounded-lg overflow-hidden ">
                <div className="flex">
                    <div className="h-1 flex-1 bg-accent"></div>
                </div>

                <div className="p-4 px-6 space-y-6 pt-6">
                    <h1 className="text-2xl font-semibold border-b border-border-light pb-4">Current Signers</h1>
                    <div>
                        <div className='flex flex-col space-y-4 pb-8 border-b border-border-light'>
                            {userWallet && userWallet.signerWithName.length > 0 ? userWallet.signerWithName.map((signer) => {
                                console.log(signer);
                                return (
                                    <div className='flex items-center gap-2'>
                                        <Blockies
                                            className="table-user-gradient rounded-full"
                                            seed={signer.address}
                                            size={10}
                                            scale={4}

                                        />
                                        <div className="flex flex-col">
                                            <span className="break-all">{signer.name}</span>
                                            <span className="break-all">{signer.address}</span>
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
                                {errors.signers && (
                                    <p className="text-red-500 text-sm">* {errors.signers}</p>
                                )}
                                {/* <button onClick={handleAddSigner} className="text-accent">+ Add new signer input</button> */}
                            </div>

                        </div>
                        <div className="py-4 text-right">
                            {addingNewSigner ? <button className="ml-auto  font-bold text-sm bg-accent text-black py-2 px-4 md:px-10 rounded-md">
                                <div className='flex items-center'>
                                    <svg
                                        aria-hidden="true"
                                        role="status"
                                        className="inline w-4 h-4 me-3 text-black animate-spin"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                    </svg>

                                    Creating... </div>
                            </button> :
                                <Button className="bg-accent text-black font-bold hover:bg-accent" onClick={createAndsignOwnerAddTransaction}>Create New Request</Button>
                            }

                        </div>
                    </div>
                </div>
            </div>

            {/* update threshold */}
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

                        {thresholdUpdateLoading ? <button className="ml-auto  font-bold text-sm bg-accent text-black py-2 px-4 md:px-10 rounded-md">
                            <div className='flex items-center'>
                                <svg
                                    aria-hidden="true"
                                    role="status"
                                    className="inline w-4 h-4 me-3 text-black animate-spin"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>

                                Creating... </div>
                        </button> :
                            <Button className="bg-accent text-black font-bold hover:bg-accent" onClick={createAndsignThresholdTransaction}>Create New Request</Button>
                        }



                    </div>
                </div>
            </div>
        </div>
    </>)
}