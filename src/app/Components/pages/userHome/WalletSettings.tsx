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
import { bittorrentchainTestnet } from "@/app/utils/getToken";
import { ethers, toUtf8Bytes } from "ethers";

const factoryAddress = contract.OrbitFactoryContractAddress;

export default function WalletSettings() {
    const params = useParams<{ address: string }>()
    console.log(params.address)
    const walletAddress = params.address
    const { address } = useAccount()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userWallet, setUserWallet] = useState<MultisigWallet>();
 const [userTransaction, setUserTransaction] = useState<MultisigTransaction[]>([]);

    
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

        fetchTransactions()
        if (params.address) { fetchWallets(params.address); fetchTransactions()}
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
    const addOwner = async (transaction :MultisigTransaction) => {

        console.log("wallet",walletAddress)
        console.log("nonce",transaction.nonce);

        const response = await fetch(`/api/manage-settings/get-by-nonce?walletAddress=${walletAddress}&nonce=${transaction.nonce}`)
        const data = await response.json();
        console.log(data);
        const signatures:any=data.signatures.signature;
        
        console.log(signatures);


        try {
            await writeContractAsync({
                address: walletAddress as Address,
                abi: OrbitWalletABI,
                functionName: 'executeTransaction',
                args: [walletAddress,0,transaction.data,transaction.deadline,transaction.nonce,signatures],
            });


            // to update the owners
            await fetch('/api/manage-settings/update-owners', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: walletAddress,
                    newSigner: {
                        address: data.signatures.newOwner,
                        name: data.signatures.name,
                      },
                  
                    
                }),
            });

            // to update the status of this trasnaction to completed

            await fetch('/api/manage-settings/request', {
                method: 'PATCH', // Use PATCH for updating
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: walletAddress,
                    nonce: data.signatures.nonce, // Include the nonce to identify the record
                }),
            });
            
            // Reset the input after successful transaction
            alert('New owner added successfully');
        } catch (error) {
            console.error('Error adding owner:', error);
        }
    };

   
    const fetchTransactions = async () => {
        try {
            
            const response = await fetch(`/api/manage-settings/request?walletAddress=${walletAddress}`)
            const data = await response.json();
            console.log(data);

            setUserTransaction(data.signatures)
            console.log("signatures", data.signatures)
        
        } catch (error) {
            console.error('Error fetching signatures:', error);
        }
    };


    const signTransaction = async (index:number) => {

        console.log(userTransaction[index]);
        const data =userTransaction[index];


        try {
            
            if (typeof window !== undefined && window.ethereum) {
                const client = createWalletClient({
                    chain: bittorrentchainTestnet,
                    transport: custom(window.ethereum),
                });
                const signature = await client?.signTypedData({
                    account: address as Address,
                    domain: {
                        name: "OrbitWallet",
                        version: "1",
                        chainId: BigInt(1029),
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
                        data: data.data,
                        nonce: BigInt(data.nonce),
                        deadline: BigInt(data.deadline) ,
                    },
                });
                console.log(signature);
                // Store the signature
                await fetch('/api/manage-settings/sign', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({        
                        walletAddress: walletAddress,
                        nonce:data.nonce,
                        signerAddress: address,
                        signature:signature,
                       
                    }),
                });
                // Refresh signatures
                console.log("done")
                // await fetchSignatures(transaction.txIndex);
            }
        } catch (err) {
            console.error("Error signing transaction:", err);
        }
    };


    // function to sign Transaction for updating owners
    const createAndsignTransaction = async () => {

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

        try {
            
            if (typeof window !== undefined && window.ethereum) {
                const client = createWalletClient({
                    chain: bittorrentchainTestnet,
                    transport: custom(window.ethereum),
                });
                const signature = await client?.signTypedData({
                    account: address as Address,
                    domain: {
                        name: "OrbitWallet",
                        version: "1",
                        chainId: BigInt(1029),
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
                console.log(signature);
                // Store the signature
                await fetch('/api/manage-settings/request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: walletAddress,
                        data:calldata,
                        nonce:nonce,
                        deadline:deadline.toString(),
                        newOwner:addressToAdd,
                        name: formData.signers[0].name,
                        signerAddress: address,
                        signature:signature,
                        status:"active"
                    }),
                });
                // Refresh signatures
                console.log("done")
                // await fetchSignatures(transaction.txIndex);
            }
        } catch (err) {
            console.error("Error signing transaction:", err);
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

                       {userTransaction && userTransaction.length > 0?(
                        <div>
                        <h1 className="text-2xl font-semibold border-b border-border-light pb-4">Member Addtion Requested</h1>

                        <div className='flex flex-col space-y-4 pb-8 border-b border-border-light'>
                            {userTransaction && userTransaction.length > 0? userTransaction.map((signer,i) => {
                                
                                return (
                                    <div className='flex items-center gap-2'>
                                        
                                        <Blockies
                                            className="table-user-gradient rounded-full"
                                            seed={signer?.newOwner}
                                            size={10}
                                            scale={4}

                                        />
                                        
                                        <div className="flex flex-col">
                                            <span className="break-all">{signer?.name}</span>
                                            <span className="break-all">{signer?.newOwner}</span>
                                        </div>
                                        {signer.signerAddress.includes(address as Address) ? (
    <Button className="bg-accent text-black font-bold" onClick={() => signTransaction(i)}>Sign</Button>
) : (
    <span>Already signed</span>
)}

                                        <Button className="bg-accent text-black font-bold" onClick={() => addOwner(signer)}>Execute</Button>
                                        Signed by :  {signer?.signerAddress.length}

                                    </div>)
                            }) : null}
                        </div>
                       </div>):null} 


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
                                {/* <button onClick={handleAddSigner} className="text-accent">+ Add new signer input</button> */}
                            </div>
                        </div>
                        <div className="py-4 text-right">
                            <Button className="bg-accent text-black font-bold" onClick={createAndsignTransaction}>Create New Request</Button>
                   

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