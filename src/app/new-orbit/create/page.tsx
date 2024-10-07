'use client'
import React, { useState } from 'react'
import { ChevronDown, Info, ArrowLeft, Orbit } from 'lucide-react'
import Navbar from '@/app/Components/Navbar'
import Blockies from "react-blockies";

export default function CreateAccount() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        network: 'BTTC',
        signers: [{ name: 'Signer 1', address: 'sep: 0x03E65DA6ac73a4DE...' }],
        threshold: 1
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, network: e.target.value })
    }

    const handleAddSigner = () => {
        setFormData({
            ...formData,
            signers: [...formData.signers, { name: `Signer ${formData.signers.length + 1}`, address: '' }]
        })
    }

    const renderStep = () => {
        switch (step) {
        case 1:
            return (
                <>
                    <div className='flex items-center justify-start gap-4 border-b border-border-light mb-8'>

                        <div className="bg-[#12FF80] text-black text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                            {step}
                        </div>

                        <div className='flex-1 flex flex-col'>
                            <span className="text-xl font-bold">Select network and name of your Safe Account</span>
                            <span className="text-gray-400 text-md mb-4">Select the network on which to create your Safe Account</span>
                        </div>
                    </div>
                    <div className='pb-6 border-b border-border-light'>
                        <div className="space-y-4 my-6 ">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#2a2a2a] rounded-md p-2 text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="network" className="block text-sm font-medium text-gray-400 mb-1">Network</label>
                                <select
                                    id="network"
                                    name="network"
                                    value={formData.network}
                                    onChange={handleNetworkChange}
                                    className="w-full bg-[#2a2a2a] rounded-md p-2 text-white"
                                >
                                    <option>BTTC</option>
                                </select>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-400">
                            By continuing, you agree to our <a href="#" className="text-[#12FF80]">terms of use</a> and <a href="#" className="text-[#12FF80]">privacy policy</a>.
                        </p>
                    </div>
                </>
            )
        case 2:
            return (
                <>
                    <div className='flex items-center justify-start gap-4 border-b border-border-light mb-8'>

                        <div className="bg-[#12FF80] text-black text-xs font-semibold rounded-full w-5 h-5 flex flex-col items-center justify-center">
                            {step}
                        </div>

                        <div className='flex-1 flex flex-col'>
                            <span className="text-xl font-bold">Signers and confirmations</span>
                            <span className="text-gray-400 text-md mb-4">Set the signer wallets of your Safe Account and how many need to confirm to execute a valid transaction.</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {formData.signers.map((signer, index) => (
                            <div key={index} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={signer.name}
                                    onChange={(e) => {
                                        const newSigners = [...formData.signers]
                                        newSigners[index].name = e.target.value
                                        setFormData({ ...formData, signers: newSigners })
                                    }}
                                    className="flex-1 bg-[#2a2a2a] rounded-md p-2 text-white"
                                    placeholder="Signer name"
                                />
                                <input
                                    type="text"
                                    value={signer.address}
                                    onChange={(e) => {
                                        const newSigners = [...formData.signers]
                                        newSigners[index].address = e.target.value
                                        setFormData({ ...formData, signers: newSigners })
                                    }}
                                    className="flex-2 bg-[#2a2a2a] rounded-md p-2 text-white"
                                    placeholder="Signer address"
                                />
                            </div>
                        ))}
                        <button onClick={handleAddSigner} className="text-[#12FF80]">+ Add new signer</button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Threshold <Info className="inline-block w-4 h-4 text-gray-400" /></h3>
                        <p className="text-gray-400 mb-2">Any transaction requires the confirmation of:</p>
                        <select
                            value={formData.threshold}
                            onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                            className="bg-[#2a2a2a] rounded-md p-2 text-white"
                        >
                            {[...Array(formData.signers.length)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <span className="ml-2 text-gray-400">out of {formData.signers.length} signer(s)</span>
                    </div>
                </>
            )
        case 3:
            return (
                <>
                    <div className='flex items-center justify-start gap-4 border-b border-border-light mb-8'>

                        <div className="bg-[#12FF80] text-black text-xs font-semibold rounded-full w-5 h-5 flex flex-col items-center justify-center">
                            {step}
                        </div>

                        <div className='flex-1 flex flex-col'>
                            <span className="text-xl font-bold">Review</span>
                            <span className="text-gray-400 text-md mb-4">You're about to create a new Orbit Account and will have to confirm the transaction with your connected wallet..</span>
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Network</span>
                            <span>{formData.network}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Name</span>
                            <span>{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Signers</span>
                            <span>{formData.signers[0].address}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Threshold</span>
                            <span>{formData.threshold} out of {formData.signers.length} signer(s)</span>
                        </div>
                    </div>
                    <h3 className="font-semibold mb-2">Before you continue</h3>
                    <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-[#12FF80] mr-2 mt-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                            <span className="text-gray-400">There will be a one-time network fee to activate your smart account wallet.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-[#12FF80] mr-2 mt-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                            <span className="text-gray-400">If you choose to pay later, the fee will be included with the first transaction you make.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-[#12FF80] mr-2 mt-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>
                            <span className="text-gray-400">Safe doesn't profit from the fees.</span>
                        </li>
                    </ul>
                    <div className="flex space-x-4">
                        <button className="flex-1 bg-[#2a2a2a] text-white py-2 px-4 rounded-md">
                            Pay now
                            <span className="block text-sm text-gray-400">≈ 0.98607 ETH</span>
                        </button>
                        <button className="flex-1 bg-[#12FF80] text-black py-2 px-4 rounded-md">
                            Pay later
                            <span className="block text-sm">with the first transaction</span>
                        </button>
                    </div>
                </>
            )
        default:
            return null
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#121212] text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Create new Orbit Account</h1>

                    <div className="flex space-x-8 ">
                        <div className="flex-1 bg-[#1c1c1c] rounded-lg overflow-hidden">
                            <div className="flex">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className={`h-1 flex-1 ${s <= step ? 'bg-[#12FF80]' : 'bg-gray-600'}`}></div>
                                ))}
                            </div>
                            <div className="mb-8 p-6 ">
                                {renderStep()}
                            </div>
                            <div className="flex justify-between">
                                {step > 1 && (
                                    <button onClick={() => setStep(step - 1)} className="flex items-center text-[#12FF80] border border-[#12FF80] py-2 px-4 rounded-md">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button onClick={() => setStep(step + 1)} className="ml-auto bg-[#12FF80] text-black py-2 px-4 rounded-md">
                                        Next
                                    </button>
                                ) : (
                                    <button className="ml-auto bg-[#12FF80] text-black py-2 px-4 rounded-md">
                                        Create
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="w-80">
                            <div className="bg-[#1c1c1c] rounded-lg p-6 flex flex-col items-center">
                                <Orbit className='w-6 h-6 mb-6' />
                                <h2 className="text-xl font-bold mb-4">Your Orbit Account preview</h2>
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between">
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
                                            <span> 0x03E6...b220</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Network</span>
                                        <span>{formData.network}</span>
                                    </div>
                                    {formData.name ? <div className="flex justify-between">
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