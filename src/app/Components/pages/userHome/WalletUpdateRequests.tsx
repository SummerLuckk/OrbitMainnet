import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import Blockies from "react-blockies";
import { MultisigTransaction, MultisigWallet } from "@/app/types/types"
import { truncateAddress } from "@/app/utils/truncateAddress"
import { Address, createWalletClient, custom } from "viem"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { useAccount, useWriteContract } from "wagmi"
import { bittorrentchainMainnet } from "@/app/utils/getToken"
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";

type TransactionType = "owner" | "threshold"
type SignerStatus = "pending" | "completed" | "failed"


const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
const SignerStatusIcon = ({ status }: { status: SignerStatus }) => {
    switch (status) {
    case "completed":
        return <div className="flex items-center"><CheckCircle2 className="text-green-500 mr-2" size={16} />Completed</div>
    case "pending":
        return <div className="flex items-center"><Clock className="text-yellow-500 mr-2" size={16} />Pending</div>
    case "failed":
        return <div className="flex items-center"><AlertCircle className="text-red-500 mr-2" size={16} />Failed</div>
    }
}
const TransactionRow = ({ transaction, userWallet }: { transaction: MultisigTransaction, userWallet: MultisigWallet }) => {
    const [showFullDetails, setShowFullDetails] = useState(false)
    const [signLoading, setSignLoading] = useState<boolean>(false)
    const [executeLoading, setExecuteLoading] = useState<boolean>(false)
    const txType = transaction ? transaction.transactionType : "owner"
    const { address } = useAccount();
    console.log("user wallet", userWallet)
    const { writeContractAsync } = useWriteContract();

    // function to sign Transaction for updating owners
    const signOwnerAddTransaction = async () => {
        setSignLoading(true)
        // // console.log(ownerUpdateTransaction[index]);
        const data = transaction;


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
                        verifyingContract: userWallet.walletAddress as Address,
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
                        to: userWallet.walletAddress as Address,
                        value: BigInt(0),
                        data: data.data,
                        nonce: BigInt(data.nonce),
                        deadline: BigInt(data.deadline),
                    },
                });
                // console.log(signature);
                // Store the signature
                await fetch('/api/manage-settings/sign', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: userWallet.walletAddress,
                        nonce: data.nonce,
                        signerAddress: address,
                        signature: signature,

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
            setSignLoading(false)
        }
    };


    //function to execute owner update request
    const addOwner = async () => {
        setExecuteLoading(true)
        console.log("wallet", userWallet.walletAddress)
        console.log("nonce", transaction.nonce);

        const response = await fetch(`/api/manage-settings/get-by-nonce?walletAddress=${userWallet.walletAddress}&nonce=${transaction.nonce}`)
        const data = await response.json();
        console.log(data);
        const signatures: any = data.signatures.signature;

        console.log(signatures);


        try {
            await writeContractAsync({
                address: userWallet.walletAddress as Address,
                abi: OrbitWalletABI,
                functionName: 'executeTransaction',
                args: [userWallet.walletAddress, 0, transaction.data, transaction.deadline, transaction.nonce, signatures],
            });


            // to update the owners
            await fetch('/api/manage-settings/update-owners', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: userWallet.walletAddress,
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
                    walletAddress: userWallet.walletAddress,
                    nonce: data.signatures.nonce, // Include the nonce to identify the record
                }),
            });

            // Reset the input after successful transaction
            alert('New owner added successfully');
        } catch (error) {
            console.error('Error adding owner:', error);
        } finally {
            setExecuteLoading(false)
        }
    };


    // sign Transaction for updating threshold
    const signThresholdTransaction = async () => {

        // console.log(thresholdUpdateTransaction[index]);
        const data = transaction;
        const walletAddress = userWallet.walletAddress;
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
                        data: data.data,
                        nonce: BigInt(data.nonce),
                        deadline: BigInt(data.deadline),
                    },
                });
                // console.log(signature);
                // Store the signature
                await fetch('/api/manage-settings/sign', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: walletAddress,
                        nonce: data.nonce,
                        signerAddress: address,
                        signature: signature,

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


    //
    // Function to update the threshold
    const updateThreshold = async () => {
        // console.log("wallet", walletAddress)
        // console.log("nonce", transaction.nonce);
        const walletAddress = userWallet.walletAddress;

        const response = await fetch(`/api/manage-settings/get-by-nonce?walletAddress=${walletAddress}&nonce=${transaction.nonce}`)
        const data = await response.json();
        // console.log(data);
        const signatures: any = data.signatures.signature;

        // console.log(signatures);


        try {
            await writeContractAsync({
                address: walletAddress as Address,
                abi: OrbitWalletABI,
                functionName: 'executeTransaction',
                args: [walletAddress, 0, transaction.data, transaction.deadline, transaction.nonce, signatures],
            });


            // to update the threshold
            await fetch('/api/manage-settings/update-threshold', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: walletAddress,
                    requiredSignatures: transaction.threshold

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
            alert('Threshold updated successfully');
        } catch (error) {
            console.error('Error adding owner:', error);
        }
    };



    const handleSignButtonClick = async (type: string) => {
        if (type === "owner") {

            console.log("Owner sign function called");
            await signOwnerAddTransaction()
        } else if (type === "threshold") {
            console.log("threshold sign function called");
            await signThresholdTransaction()
        }
    }
    const handleExecuteButtonClick = async (type: string) => {
        if (type === "owner") {
            console.log("Owner update execute function called");
            await addOwner()
        } else if (type === "threshold") {
            console.log("threshold update execute function called");
            await updateThreshold()
        }
    }
    return (
        <TableRow className="hover:bg-[none]">
            <TableCell>{transaction.transactionType}</TableCell>
            <TableCell>{shortenAddress(transaction.walletAddress)}</TableCell>
            <TableCell>{transaction.status}</TableCell>
            <TableCell>{formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}</TableCell>
            <TableCell>
                <Dialog>

                    <DialogTrigger asChild>
                        <Button className="bg-accent text-black hover:bg-accent hover:text-black border-accent" variant="outline" size="sm" onClick={() => setShowFullDetails(true)}>View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="text-white bg-dark-gray border-none p-0 m-0 rounded-lg overflow-hidden font-dmsans">
                        <div className="flex">
                            <div className="h-1 flex-1 bg-accent"></div>
                        </div>
                        <div className="p-3 md:p-6 space-y-6">
                            <DialogHeader className="border-b border-border-light pb-4">
                                <DialogTitle>{txType === "owner" ? "Owner Update" : "Threshold Update"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div><p className="text-gray-400 text-sm">Wallet Address:</p> <p className="text-[1rem] py-1">{transaction.walletAddress}</p></div>
                                {txType === "owner" ?
                                    <div><p className="text-gray-400 text-sm">New Owner:</p> {transaction.newOwner}</div> :
                                    <div><p className="text-gray-400 text-sm">New Threshold:</p> {transaction.threshold}</div>}
                                <div><p className="text-gray-400 text-sm">Signer Address: <span className="text-white">{userWallet && userWallet.requiredSignatures} out of {userWallet && (userWallet.signerAddresses).length} signer(s)</span></p>
                                    {userWallet && userWallet.signerWithName.length > 0 ? userWallet.signerWithName.map((signer, index) => {
                                        return (
                                            <div className='flex flex-row w-full items-center gap-2 my-2' key={index}>
                                                <Blockies
                                                    className="table-user-gradient rounded-full"
                                                    seed={signer.address}
                                                    size={10}
                                                    scale={4}

                                                />
                                                <div className="flex flex-col">
                                                    <span className="break-all">{signer.name}
                                                        <span>
                                                            {address === signer.address ?
                                                                <span className={" ml-2 px-1 py-0 rounded-full text-xs font-semibold bg-accent text-black"}>
                                                                    You
                                                                </span> : null}
                                                        </span></span>
                                                    <span className="break-all">{truncateAddress(signer.address as Address)} </span>
                                                </div>
                                                <div className="ml-auto">
                                                    <SignerStatusIcon status={transaction.signerAddress.includes(signer.address) ? "completed" : "pending"} />
                                                </div>
                                            </div>)
                                    }) : null}


                                </div>

                                <div><p className="text-gray-400 text-sm">Timestamp:</p> {new Date(transaction.timestamp).toLocaleString()}</div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="bg-accent text-black font-semibold hover:bg-accent hover:text-black"
                                    onClick={() => handleSignButtonClick(txType)}
                                    disabled={transaction.signerAddress.includes(address as Address)}>
                                    {signLoading ? <div className='flex items-center'>
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

                                        Loading </div> : "Sign"}
                                </Button>
                                <Button
                                    className="bg-accent text-black font-semibold hover:bg-accent hover:text-black"
                                    onClick={() => handleExecuteButtonClick(txType)}
                                    disabled={
                                        userWallet && transaction.signerAddress.filter(signerAddress =>
                                            userWallet.signerWithName.some(signer => signer.address === signerAddress)
                                        ).length < Number(userWallet.requiredSignatures)}>
                                    {executeLoading ? <div className='flex items-center'>
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

                                        Loading </div> : "Execute"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </TableCell>
        </TableRow>
    )
}
interface WalletUpdateRequestsProps {
    transactions: MultisigTransaction[];
    userWallet?: MultisigWallet;

}
export default function WalletUpdateRequests({ transactions, userWallet }: WalletUpdateRequestsProps) {

    return (
        <div className="bg-dark-gray  rounded-lg overflow-hidden font-dmsans">
            <div className="flex">
                <div className="h-1 flex-1 bg-accent"></div>
            </div>
            <div className="p-4 px-6 space-y-6 pt-6">
                <h1 className="text-2xl font-semibold border-b border-border-light pb-4">Update Requests</h1>
                <Tabs defaultValue="owner" className="w-full">
                    <TabsList className="mb-4 bg-border-light p-1 rounded-lg ">
                        <TabsTrigger
                            value="owner"
                            className="data-[state=active]:bg-accent data-[state=active]:text-black rounded-md transition-all"
                        >
                            Owner
                        </TabsTrigger>
                        <TabsTrigger
                            value="threshold"
                            className="data-[state=active]:bg-accent data-[state=active]:text-black rounded-md transition-all"
                        >
                            Threshold
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="owner">
                        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border-light">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-transparent border-border-light hover:bg-[none]">
                                        <TableHead className=" text-gray-400">Type</TableHead>
                                        <TableHead className="text-gray-400">Wallet</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Time</TableHead>
                                        <TableHead className="text-gray-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.filter(t => t.transactionType === "owner").map(transaction => (
                                        <TransactionRow key={transaction._id} transaction={transaction} userWallet={userWallet!} />
                                    ))}
                                </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="threshold">
                        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border-light">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-transparent border-border-light hover:bg-[none]">
                                        <TableHead className=" text-gray-400">Type</TableHead>
                                        <TableHead className="text-gray-400">Wallet</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Time</TableHead>
                                        <TableHead className="text-gray-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.filter(t => t.transactionType === "threshold").map(transaction => (
                                        <TransactionRow key={transaction._id} transaction={transaction} userWallet={userWallet!} />
                                    ))}
                                </TableBody>
                            </Table>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}