"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Info, ArrowLeft, Orbit, Trash2, X } from "lucide-react";
import Blockies from "react-blockies";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Address, getContract, parseEther } from "viem";
import OrbitWalletFactoryABI from "@/app/Contract/OrbitFactoryABI.json";
import contract from "@/app/utils/ContractAddress.json";
import { createWalletClient, custom, http } from "viem";
import { ToastContainer, toast } from "react-toastify";

import { truncateAddress } from "@/app/utils/truncateAddress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/app/utils/config";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import {
  getNameByAddress,
  getStoredSigners,
} from "@/app/utils/getNameByAddress";
import { privateKeyToAccount } from "viem/accounts";
import { bittorrentchainMainnet } from "@/app/utils/getToken";
import Link from "next/link";

const factoryAddress = contract.OrbitFactoryContractAddress;

export default function CreateAccount() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [creatingWalletLoading, setCreatingWalletLoading] =
    useState<boolean>(false);
  const [step, setStep] = useState(1);
  const [LocalStoredsigners, setLocalStoredSigners] = useState<
    { name: string; address: string }[]
  >([]);

  useEffect(() => {
    setLocalStoredSigners(getStoredSigners());
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    network: "BTTC",
    signers: [
      { name: "", address: address as `0x${string}` | "" },
      { name: "", address: "" },
    ],
    threshold: 1,
  });
  const [errors, setErrors] = useState({
    signers: "",
    threshold: "",
  });

  useEffect(() => {
    if (address) {
      setFormData({
        name: "",
        network: "BTTC",
        signers: [
          {
            name: getNameByAddress(address),
            address: address as `0x${string}`,
          },
          { name: "", address: "" },
        ],
        threshold: 1,
      });
    }
  }, [address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNetworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, network: e.target.value });
  };

  const handleAddSigner = () => {
    setFormData({
      ...formData,
      signers: [...formData.signers, { name: "", address: "" }],
    });
  };

  const handleDeleteSigner = (index: number) => {
    const newSigners = formData.signers.filter((_, i) => i !== index);
    setFormData({ ...formData, signers: newSigners });
  };

  const handleThresholdChange = (e: string) => {
    const value = Number(e);
    setFormData({ ...formData, threshold: value });

    // Clear threshold error if valid
    if (value >= 2) {
      setErrors((prev) => ({ ...prev, threshold: "" }));
    }
  };

  const handleSignerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "name" | "address"
  ) => {
    const newSigners = [...formData.signers];
    newSigners[index][field] = e.target.value;

    // Auto-populate name if the address exists in local storage
    if (field === "address") {
      const existingSigner = LocalStoredsigners.find(
        (signer) => signer.address === e.target.value
      );
      if (existingSigner) {
        newSigners[index].name = existingSigner.name;
      }
    }

    setFormData({ ...formData, signers: newSigners });

    // Error handling logic for signers
    const validSigners = newSigners.filter((signer) => signer.address !== "");
    if (validSigners.length >= 2) {
      setErrors((prev) => ({ ...prev, signers: "" })); // Clear signers error if valid
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="flex items-center justify-start gap-4 border-b border-border-light mb-8">
              <div className="bg-accent text-black text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {step}
              </div>

              <div className="flex-1 flex flex-col">
                <span className="text-lg md:text-xl font-bold">
                  Enter the name of your Orbit Account
                </span>
                <span className="text-gray-400 text-sm md:text-md mb-4">
                  This name helps identify and manage your wallet and will be
                  stored off-chain.
                </span>
              </div>
            </div>
            <div className="pb-6 border-b border-border-light px-0 md:px-8">
              <div className="space-y-4 my-6 ">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="network"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Network
                  </label>
                  <input
                    type="text"
                    id="network"
                    name="name"
                    disabled
                    value={formData.network}
                    onChange={handleNetworkChange}
                    placeholder="Enter Network"
                    className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent cursor-not-allowed"
                  />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                By continuing, you agree to our{" "}
                <a href="#" className="text-accent">
                  terms of use
                </a>{" "}
                and{" "}
                <a href="#" className="text-accent">
                  privacy policy
                </a>
                .
              </p>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="flex items-center justify-start gap-4 border-b border-border-light mb-8">
              <div className="bg-accent text-black text-xs font-semibold rounded-full w-5 h-5 flex flex-col items-center justify-center">
                {step}
              </div>

              <div className="flex-1 flex flex-col">
                <span className="text-lg md:text-xl font-bold">
                  Signers and confirmations
                </span>
                <span className="text-gray-400 text-sm md:text-md mb-4">
                  Set the signer wallets of your Orbit Account and how many need
                  to confirm to execute a valid transaction.
                </span>
              </div>
            </div>
            <div className="pb-6 border-b border-border-light px-0 md:px-8">
              <div className="space-y-8">
                {formData.signers.map((signer, index) => (
                  <div key={index} className="flex space-x-2 items-end">
                    <div className="w-1/3">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-500 mb-1"
                      >
                        Signer Name
                      </label>
                      <input
                        type="text"
                        value={signer.name}
                        // onChange={(e) => {
                        //     const newSigners = [...formData.signers]
                        //     newSigners[index].name = e.target.value
                        //     setFormData({ ...formData, signers: newSigners })
                        // }}
                        onChange={(e) => handleSignerChange(e, index, "name")}
                        className=" bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                        placeholder={"Signer " + (index + 1)}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-500 mb-1"
                      >
                        Signer
                      </label>
                      <input
                        type="text"
                        value={signer.address}
                        // onChange={(e) => {
                        //     const newSigners = [...formData.signers]
                        //     newSigners[index].address = e.target.value as Address
                        //     setFormData({ ...formData, signers: newSigners })
                        // }}
                        onChange={(e) =>
                          handleSignerChange(e, index, "address")
                        }
                        className="bg-transparent border border-border-light p-4 w-full bg-[#2a2a2a] rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                        placeholder="Signer address"
                      />
                    </div>

                    {index > 0 ? (
                      <button
                        onClick={() => handleDeleteSigner(index)}
                        className="p-4 bg-[#2a2a2a] rounded-md text-trans-red hover:bg-trans-red hover:text-white transition-colors duration-200"
                        aria-label="Delete signer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteSigner(index)}
                        className="opacity-0 pointer-events-none p-4 bg-[#2a2a2a] rounded-md text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                        aria-label="Delete signer"
                        disabled
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {errors.signers && (
                  <p className="text-red-500 text-sm">* {errors.signers}</p>
                )}
                <button onClick={handleAddSigner} className="text-accent">
                  + Add new signer
                </button>
              </div>
            </div>
            <div className="pb-6 border-b border-border-light px-0 md:px-8">
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold mb-2">
                  Threshold{" "}
                  <Info className="inline-block w-4 h-4 text-gray-400" />
                </h3>
                <p className="text-gray-400 mb-2">
                  Any transaction requires the confirmation of:
                </p>

                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => handleThresholdChange(value)}
                    defaultValue={formData.threshold.toString()}
                  >
                    <SelectTrigger className="max-w-max">
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-gray">
                      {[...Array(formData.signers.length)].map((_, i) => (
                        <SelectItem
                          key={i}
                          value={(i + 1).toString()}
                          className="bg-dark-gray text-accent"
                        >
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="ml-2 text-gray-400">
                    out of {formData.signers.length} signer(s)
                  </span>
                </div>
              </div>
              {errors.threshold && (
                <p className="text-red-500 text-sm mt-4">
                  * {errors.threshold}
                </p>
              )}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="flex items-center justify-start gap-4 border-b border-border-light mb-8">
              <div className="bg-accent text-black text-xs font-semibold rounded-full w-5 h-5 flex flex-col items-center justify-center">
                {step}
              </div>

              <div className="flex-1 flex flex-col">
                <span className="text-lg md:text-xl font-bold">Review</span>
                <span className="text-gray-400 text-sm md:text-md mb-4">
                  You're about to create a new Orbit Account and will have to
                  confirm the transaction with your connected wallet..
                </span>
              </div>
            </div>
            <div className="pb-6 border-b border-border-light px-0 md:px-8">
              <div className="space-y-6 mb-4">
                <div className="flex flex-col md:flex-row justify-start">
                  <span className="text-gray-400 w-1/4">Network</span>
                  <span>{formData.network}</span>
                </div>
                <div className="flex flex-col md:flex-row justify-start">
                  <span className="text-gray-400  w-1/4">Name</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex flex-col md:flex-row justify-start">
                  <span className="text-gray-400 w-1/4 mb-2 md:mb-0">
                    Signers
                  </span>
                  <div className="flex flex-col items-start space-y-4 max-w-full">
                    {formData.signers.length > 0
                      ? formData.signers.map((signer, index) => {
                          return (
                            <div
                              className="flex items-center gap-2"
                              key={index}
                            >
                              <Blockies
                                className="table-user-gradient rounded-full"
                                seed={signer.address}
                                size={10}
                                scale={4}
                              />
                              <span className="break-all text-sm flex flex-col">
                                <span className="text-gray-400">
                                  {signer.name}
                                </span>
                                {signer.address}
                              </span>
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>
                <div className="flex justify-start">
                  <span className="text-gray-400  w-1/4">Threshold</span>
                  <span>
                    {formData.threshold} out of {formData.signers.length}{" "}
                    signer(s)
                  </span>
                </div>
              </div>
            </div>
            <div className="pb-6 border-b border-border-light px-0 md:px-8">
              <div className="space-y-4 pt-6">
                <h3 className="font-semibold mb-2">Before you continue</h3>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-accent mr-2 mt-1"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-400">
                      There will be a one-time network fee to activate your
                      smart account wallet on the mainnet.
                    </span>
                  </li>
                  <li className="flex items-start"></li>
                </ul>
              </div>
            </div>

            <div className="pb-6 border-b border-border-light px-0 md:px-8">
              <div className="space-y-6 mb-4 pt-6">
                <div className="flex flex-col md:flex-row justify-start">
                  <span className="text-gray-400 w-full md:w-1/4 mb-6 md:mb-0">
                    Est. network fee
                  </span>
                  <div className="flex flex-col">
                    <span className="bg-accent-light p-2 font-bold text-white rounded-lg max-w-max">
                      ≈ 1068 {formData.network}
                    </span>
                    <p className="text-gray-500 mt-4 text-sm">
                      You will have to confirm a transaction with your connected
                      wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleCreateOrbitMultisig = async () => {
    setCreatingWalletLoading(true);
    const ownersArray = formData.signers.map((signer) => signer.address);

    // Create an array to hold valid signers with both name and address
    const validSigners = formData.signers.filter(
      (signer) => signer.name.trim() !== "" && signer.address.trim() !== ""
    );

    // Update local storage with valid signers only
    if (validSigners.length > 0) {
      const updatedSigners = validSigners.map((signer) => {
        const existingSigner = LocalStoredsigners.find(
          (s) => s.address === signer.address
        );
        if (existingSigner) {
          // Update name if address already exists
          existingSigner.name = signer.name;
          return existingSigner;
        } else {
          // Add new signer if not found in local storage
          return { name: signer.name, address: signer.address };
        }
      });

      // Store updated signers in local storage
      localStorage.setItem("signers", JSON.stringify(updatedSigners));
    }

    console.log(formData);
    // console.log(address.toLowerCase());
    // ownersArray.push(address.toLowerCase());
    try {
      const tx = await writeContractAsync({
        address: factoryAddress as Address,
        abi: OrbitWalletFactoryABI,
        functionName: "createWallet",
        args: [ownersArray, formData.threshold],
        value: parseEther("1068"),
      });
      let walletAddress;
      // Wait for the transaction to be confirmed
      const receipt = await waitForTransactionReceipt(config as any, {
        hash: tx,
      });
      console.log(receipt);
      // Topic for the WalletCreated event (hash of the event signature)
      const eventTopic = ethers.id("WalletCreated(address,address[],uint256)");
      console.log(eventTopic);
      // Find the event log that matches the WalletCreated event
      const event = receipt.logs.find((log) => log.topics[0] === eventTopic);
      console.log(event);
      if (event) {
        console.log("inside of event");
        // Decode the event data to extract the wallet address
        // Decode the indexed wallet address from topics[1]
        walletAddress = ethers.getAddress(`0x${event.topics[1]?.slice(-40)}`);

        console.log("Created Wallet Address:", walletAddress);
        console.log("Created Wallet Address:", walletAddress);
      } else {
        console.error("WalletCreated event not found in the logs.");
      }
      const data = {
        walletAddress: walletAddress,
        name: formData.name,
        signerWithName: formData.signers, // Array of signerName and signer (address)
        createdBy: address,
        requiredSignatures: formData.threshold,
      };
      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast(`Multisig wallet created: ${walletAddress}`);

        // Delay navigation to allow the toast to show
        setTimeout(() => {
          router.push("/welcome/accounts");
        }, 3000); // Wait for 3 seconds before navigating
      } else {
        toast(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setCreatingWalletLoading(false);
    }
  };
  const handleStepForward = (step: number) => {
    if (step === 2) {
      const { signers, threshold } = formData;
      let errorMessages = { signers: "", threshold: "" };

      // Check for minimum 2 signers with valid addresses
      const validSigners = signers.filter((signer) => signer.address !== "");
      if (validSigners.length < 2) {
        errorMessages.signers =
          "At least 2 valid signers with addresses are required.";
      }
      // Check if threshold is at least 2
      if (threshold < 2) {
        errorMessages.threshold = "Threshold must be at least 2.";
      }
      // If there are any errors, update the state and stop the process
      if (errorMessages.signers || errorMessages.threshold) {
        setErrors(errorMessages);
        return; // Prevent moving to the next step if there are errors
      }
      // Clear any previous errors if validation passes
      setErrors({ signers: "", threshold: "" });

      // Proceed to the next step
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };
  return (
    <>
      <div className="min-h-screen bg-[#121212] text-white p-6 md:p-8 font-dmsans">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Create Orbit Multisig Wallet
          </h1>

          <div className="flex flex-col-reverse md:flex-row space-x-0 md:space-x-8 gap-8 md:gap-0">
            <div className="flex-1 bg-[#1c1c1c] rounded-lg overflow-hidden">
              <div className="flex">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 ${
                      s <= step ? "bg-accent" : "bg-border-light"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="mb-8 p-6 ">{renderStep()}</div>
              <div className="flex justify-between px-4 md:px-12 pb-6">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center font-bold text-sm text-accent border border-accent py-2 px-4 md:px-10 rounded-md"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                )}
                {step === 1 && (
                  <Link
                    href={"/welcome/accounts"}
                    className="flex items-center font-bold text-sm text-accent border border-accent py-2 px-4 md:px-10 rounded-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Link>
                )}
                {step < 3 ? (
                  <button
                    onClick={() => handleStepForward(step)}
                    className="ml-auto font-bold text-sm bg-accent text-black py-2 px-4 md:px-10 rounded-md"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="ml-auto  font-bold text-sm bg-accent text-black py-2 px-4 md:px-10 rounded-md"
                    onClick={handleCreateOrbitMultisig}
                  >
                    {creatingWalletLoading ? (
                      <div className="flex items-center">
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline w-4 h-4 me-3 text-black animate-spin"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor"
                          />
                        </svg>
                        Creating...{" "}
                      </div>
                    ) : (
                      "Create"
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="w-full md:w-80">
              <div className="bg-[#1c1c1c] rounded-md flex flex-col items-center border border-border-light">
                <div className="flex flex-col items-center justify-center border-b border-border-light p-6 pb-2">
                  <Orbit className="w-6 h-6 mb-4" />
                  <h2 className="text-xl font-semibold mb-4">
                    Your Orbit Account preview
                  </h2>
                </div>
                <div className="w-full ">
                  <div className="flex justify-between border-b border-border-light p-6 py-4">
                    <span className="text-gray-400">Wallet</span>
                    <div className="flex items-center gap-2">
                      <Blockies
                        className="table-user-gradient rounded-full"
                        seed={"something can be added here"}
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
                  {formData.name ? (
                    <div className="flex justify-between border-b border-border-light p-6 py-4">
                      <span className="text-gray-400">Name</span>
                      <span>{formData.name}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
