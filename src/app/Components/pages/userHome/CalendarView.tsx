'use client'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getChainId } from '@wagmi/core';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, DollarSign, User } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import NewTransaction from './NewTransaction'
import OrbitWalletABI from "@/app/Contract/OrbitABI.json";
import { useAccount, useWriteContract } from 'wagmi'
import { useParams } from 'next/navigation'
import { Address, Client, createWalletClient, custom, formatUnits, getContract, http } from 'viem'
import { initializeClient } from '@/app/utils/publicClient'
import { config } from '@/app/utils/config'
import { bittorrentchainTestnet, getTokenDetails } from '@/app/utils/getToken'
import { TokenDetails } from '@/app/types/types'
import { useWindowSize } from '@/hooks/useWindowSize'

const localizer = momentLocalizer(moment);

type CalendarEvent = {
    title: string;
    start: Date; // Ensure `tx.date` is properly converted
    end: Date;
    allDay: boolean;
    amount: number;
    txIndex: number;
    currency: string; // Adjust this if you have currency data
    executed: boolean;
};

const eventColors = {
    pending: 'bg-dark-gray text-white border-border-light',
    readyToExecute: 'bg-green-100 text-green-800 border-green-300',
    executed: 'bg-dark-gray text-white border-border-light',
}
type ApiTransaction = {
    _id: { $oid: string };
    walletAddress: string;
    receiverAddress: string;
    amount: number;
    txHash: string;
    createdBy: string;
    requiredSignatures: string[];
    signatures: Record<string, any>;
    executed: boolean;
    createdAt: { $date: { $numberLong: string } };
    scheduledTime: { $date: { $numberLong: string } };
};

interface Transaction {
    txIndex: number;
    receiver: string;
    amount: bigint;
    tokenAddress: string;
    executed: boolean;
    nonce: string;
    date: number;
    amt: bigint;
}

export default function CalendarView() {
    const { isMobile } = useWindowSize()
    // console.log("is Mobileeee", isMobile)
    const params = useParams()
    const walletAddress = params.address
    const [view, setView] = useState<View>(isMobile ? 'day' : 'month');
    const { address } = useAccount()
    const [date, setDate] = useState(new Date());
    const [signatures, setSignatures] = useState([])
    const [signerAddress, setSignerAddresses] = useState<string[]>([]);
    const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);


    useEffect(() => {
        if (isMobile) {
            setView('day')
        } else {
            setView('month')
        }
    }, [isMobile])
    // const [events, setEvents] = useState<CalendarEvent[]>([
    //     {
    //         id: '1',
    //         title: 'Transfer ETH',
    //         start: new Date(2024, 5, 15, 10, 0),
    //         end: new Date(2024, 5, 15, 11, 0),
    //         description: 'Monthly payment to contractor',
    //         signers: ['Alice', 'Bob'],
    //         requiredSignatures: 2,
    //         currentSignatures: 1,
    //         receiver: '0x1234...5678',
    //         amount: '100',
    //         currency: 'ETH',
    //     },
    //     {
    //         id: '2',
    //         title: 'Approve Token Spend',
    //         start: new Date(2024, 8, 15, 14, 0),
    //         end: new Date(2024, 8, 15, 15, 0),
    //         description: 'Approve USDC spend for Uniswap',
    //         signers: ['Alice', 'Bob', 'Charlie'],
    //         requiredSignatures: 2,
    //         currentSignatures: 2,
    //         receiver: '0xUniswap...Contract',
    //         amount: '1000',
    //         currency: 'USDC',
    //     },
    //     {
    //         id: '3',
    //         title: 'Execute Swap',
    //         start: new Date(2024, 6, 15, 16, 0),
    //         end: new Date(2024, 6, 15, 17, 0),
    //         description: 'Swap USDC for ETH on Uniswap',
    //         signers: ['Alice', 'Bob'],
    //         requiredSignatures: 2,
    //         currentSignatures: 2,
    //         receiver: '0xUniswap...Contract',
    //         amount: '1000',
    //         currency: 'USDC',
    //     },
    //     {
    //         id: '4',
    //         title: 'Transfer DAI',
    //         start: new Date(2024, 9, 15, 18, 0),
    //         end: new Date(2024, 9, 15, 19, 0),
    //         description: 'Payment for services',
    //         signers: ['Alice', 'Charlie'],
    //         requiredSignatures: 2,
    //         currentSignatures: 1,
    //         receiver: '0x5678...9012',
    //         amount: '500',
    //         currency: 'DAI',
    //     },
    // ])
    const { writeContractAsync } = useWriteContract()
    const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>()
    const [isAddingEvent, setIsAddingEvent] = useState(false)
    const [transactions, setTransaction] = useState<Transaction[]>([])
    const [threshold, setThreshold] = useState<Number>(0)
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: '',
        start: new Date(),
        end: new Date(),
        amount: 0,
        currency: '',
    })
    // Simulating API call
    // const fetchTransactionsFromApi = async () => {
    //     // Replace with your actual API call


    //     // const apiResponse: ApiTransaction[] = await fetchYourApiTransactions();
    //     const response = await fetch(`/ api / transactions / get - by - wallet ? walletAddress = ${ walletAddress }& connectedUserAddress=${ address } `);
    //     const apiResponse: ApiTransaction[] = await response.json();

    //     if (response.ok) {
    //         console.log(apiResponse)

    //     } else {
    //         console.log('Failed to fetch wallets');
    //     }
    //     // Convert API transactions to CalendarEvents
    //     const newEvents = apiResponse.map(mapApiTransactionToEvent);

    //     console.log(newEvents)
    //     // Update the events state
    //     setEvents(newEvents);
    // };

    // useEffect(() => {
    //     if (address && walletAddress)
    //         fetchTransactionsFromApi();
    // }, [address, walletAddress]);
    const chainId = getChainId(config);
    const client = initializeClient(chainId);

    const getWalletTransactions = async (walletAddress: Address) => {
        const walletContract = getContract({
            address: walletAddress,
            abi: OrbitWalletABI,
            client: client as Client,
        });

        try {
            const transactionsData: Transaction[] | unknown = await walletContract.read.getAllTransactions();
            console.log(transactionsData)
            if (transactionsData) { setTransaction(transactionsData as Transaction[]) }
            const thresholdValue = await walletContract.read.numConfirmationsRequired();
            setThreshold(Number(thresholdValue));
        } catch (error) {
            console.error('Error fetching transactions or threshold:', error);
        }
    };





    useEffect(() => {
        if (walletAddress) { getWalletTransactions(walletAddress as Address) }
    }, [walletAddress])

    const handleSelectSlot = useCallback(
        ({ start, end }: { start: Date; end: Date }) => {
            setIsAddingEvent(true)
            setNewEvent({ ...newEvent, start, end })
        },
        [newEvent]
    )

    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            setSelectedEvent(event)
        },
        []
    )

    // const eventStyleGetter = useCallback(
    //     (event: CalendarEvent) => {
    //         let style = ''
    //         if (event.currentSignatures === event.requiredSignatures) {
    //             style = eventColors.readyToExecute
    //         } else if (event.currentSignatures > 0) {
    //             style = eventColors.pending
    //         } else {
    //             style = eventColors.executed
    //         }
    //         return {
    //             className: `${style} rounded - lg border shadow - sm`,
    //             style: {
    //                 border: '1px solid',
    //             },
    //         }
    //     },
    //     []
    // )

    useEffect(() => {
        if (selectedEvent) {
            fetchSignatures(selectedEvent.txIndex as number)
        }
    }, [selectedEvent])

    const { components, defaultView } = useMemo(() => ({
        components: {
            toolbar: CustomToolbar,
            event: CustomEvent,
        },
        defaultView: isMobile ? Views.DAY : Views.MONTH,
    }), [])


    const loadTokenDetails = async (tokenAddress: Address): Promise<TokenDetails | null> => {
        if (tokenAddress && address) {
            // console.log(address);
            const details = await getTokenDetails(tokenAddress, address);
            return details;
        }
        return null;
    };


    const calendarEvents = transactions.map((tx: Transaction) => {


        return {
            txIndex: tx.txIndex,
            title: `${tx.receiver}`,
            receiver: tx.receiver,
            date: tx.date,
            start: new Date(Number(tx.date)),
            end: new Date(Number(tx.date)),
            allDay: true,
            nonce: `${tx.nonce}`,
            tokenAddress: tx.tokenAddress,
            amt: tx.amount,
            amount: `${formatUnits(tx.amount, 18)} `,
            currency: 'BTTC',
            executed: tx.executed
        };

    });

    const fetchSignatures = async (txIndex: number) => {
        try {
            // console.log(txIndex);
            const response = await fetch(`/api/manage-signature?walletAddress=${walletAddress}&txIndex=${txIndex}`)
            const data = await response.json();
            // console.log("signatures", data)
            setSignatures(data.signatures.map((s: any) => s.signature));
            setSignerAddresses(data.signatures.map((s: any) => s.signerAddress));
            const signerAddress = data.signatures.map((s: any) => s.signerAddress);
            // console.log(signerAddress, address)
        } catch (error) {
            console.error('Error fetching signatures:', error);
        }
    };

    const signTransaction = async (transaction: Transaction) => {
        // ...sign transaction logic
        // console.log(transaction)
        try {
            // const client = createWalletClient({
            //     chain: bittorrentchainTestnet,
            //     transport: http("https://pre-rpc.bittorrentchain.io/"),
            // });
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
                        receiver: transaction.receiver as Address,
                        amount: transaction.amt,
                        tokenAddress: transaction.tokenAddress as `0x${string}`,
                        nonce: transaction.nonce as `0x${string}`,
                        date: BigInt(transaction.date),
                    },
                });
                // console.log(signature);
                // Store the signature
                await fetch('/api/manage-signature', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: walletAddress,
                        txIndex: transaction.txIndex.toString(),
                        signature,
                        signerAddress: address,
                    }),
                });
                // Refresh signatures
                // console.log("done")
                await fetchSignatures(transaction.txIndex);
            }
        } catch (err) {
            console.error("Error signing transaction:", err);
        }
    };

    const executeTransaction = async (transaction: Transaction) => {

        // console.log(transaction);

        if (transaction.tokenAddress === "0x0000000000000000000000000000000000000000") {
            // console.log(signatures)
            await writeContractAsync({
                address: walletAddress as Address,
                abi: OrbitWalletABI,
                functionName: "executeScheduledTransaction",
                args: [
                    transaction.txIndex,
                    signatures
                ]
            });
        }
        else {
            // console.log(signatures)
            await writeContractAsync({
                address: walletAddress as Address,
                abi: OrbitWalletABI,
                functionName: "executeScheduledTransaction",
                args: [
                    transaction.txIndex,
                    signatures
                ],
                value: BigInt(0)

            });
        }


    }
    const getEventStyle = (event: any) => {
        const currentDate = moment();
        const eventStartDate = moment(event.start);
        // console.log(eventStartDate);

        if (eventStartDate.isBefore(currentDate, 'day')) {
            return {
                style: { backgroundColor: 'red' }, // Past date
            };
        } else if (eventStartDate.isSame(currentDate, 'day')) {
            return {
                style: { backgroundColor: 'green' }, // Current date
            };
        } else {
            return {
                style: { backgroundColor: 'yellow' }, // Future date
            };
        }
    };

    const colorLegend = {
        "trans-red": 'Past events (date has passed)',
        "trans-green": 'Current events (today)',
        "accent": 'Upcoming events (date is in the future)',
    };



    return (
        <div className="min-h-screen py-4 bg-dark-black text-white">
            <style jsx global>{`
    .rbc-calendar {
        background-color: #1E1E1E;
        border-radius: 8px;
        overflow: hidden;
        padding: 20px;
    }

    .rbc-header {
        padding: 8px;
        font-weight: bold;
        border-bottom: none;
    }

    .rbc-time-header-content {
        border-left: none;
    }

    .rbc-time-view, .rbc-month-view {
        border: none;
    }

    .rbc-time-content {
        border-top: 1px solid #2c2c2c;
    }

    .rbc-time-header.rbc-overflowing {
        border-right: none;
    }

    .rbc-timeslot-group {
        border-bottom: 1px solid #2c2c2c;
    }

    .rbc-timeslot-group:last-child {
        border-bottom: none;
    }

    .rbc-time-slot {
        border-top: none;
    }

    .rbc-day-slot.rbc-time-slot {
        border-top: none;
    }

    .rbc-day-slot.rbc-events-container {
        margin-right: 0;
    }

    .rbc-event {
        border: none;
        padding: 0;
        background: transparent;
        border-radius: 0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .rbc-event-label {
        display: none;
    }

    .rbc-event-content {
        font-size: 0.875rem;
        padding: 0;
    }

    .rbc-time-gutter.rbc-timeslot-group {
        border-bottom: none;
    }
    .rbc-time-column .rbc-timeslot-group{
        border-left:1px solid #2c2c2c;
    }
    .rbc-day-slot .rbc-time-slot{
        border-top:1px solid #2c2c2c;
    }

    .rbc-time-gutter.rbc-time-slot {
        color: #6B7280;
        font-size: 0.75rem;
    }

    .rbc-day-slot.rbc-event {
        border: none;
    }

    .rbc-today {
        background-color: rgba(255, 255, 255, 0.09);
    }

    .rbc-off-range {
        color: #242424;
    }

    .rbc-off-range-bg {
        background-color: #191919;
        color: #1c1c1c;
    }

    .rbc-header, .rbc-header + .rbc-header {
        border-left: none;
    }

    .rbc-day-bg + .rbc-day-bg {
        border-left: 1px solid #2c2c2c;
    }

    .rbc-month-row + .rbc-month-row {
        border-top: 1px solid #2c2c2c;
    }

    .rbc-month-view {
        border: 1px solid #2c2c2c;
        border-radius: 8px;
    }

    .rbc-toolbar button {
        color: #ffffff;
        border: 1px solid #2c2c2c;
        background-color: transparent;
    }

    .rbc-toolbar button:hover {
        background-color: #2c2c2c;
    }

    .rbc-toolbar button:active,
    .rbc-toolbar button.rbc-active {
        background-color: #3c3c3c;
        border-color: #4c4c4c;
    }

    th.rbc-header {
        border: 1px solid #3c3c3c;
    }

    @media (max-width: 768px) {
        .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .rbc-toolbar-label {
            margin: 10px 0;
        }
    }
`}</style>

            {/* Legend */}
            <div className='flex flex-col md:flex-row mb-6 gap-2 md:gap-3'>
                {Object.entries(colorLegend).map(([color, description]) => (
                    <div key={color} className='flex items-center'>
                        <span style={{ background: color }} className={`w-5 h-5 mr-2 rounded-sm ${color === "trans-green" ? "bg-trans-green" : color === "trans-red" ? "bg-trans-red" : "bg-accent"}`}></span>
                        <span>{description}</span>
                    </div>
                ))}
            </div>

            {view && <Calendar<CalendarEvent, object>
                localizer={localizer}
                events={calendarEvents as []}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                style={{ height: 'calc(100vh - 2rem)' }}
                eventPropGetter={getEventStyle}
                components={components as any}
                // defaultView={defaultView}
                views={['month', 'week', 'day', 'agenda']}
                view={view} // Include the view prop
                date={date} // Include the date prop
                onView={(view) => setView(view)}
                onNavigate={(date) => {
                    setDate(new Date(date));
                }}
            />}

            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E] text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Schedule New Transaction</DialogTitle>
                    </DialogHeader>
                    <NewTransaction date={newEvent.end as Date} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="max-w-2xl bg-dark-gray text-white max-h-[90vh] overflow-y-auto p-10">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Time:</span>
                            <span className="ml-2 text-gray-300">
                                {selectedEvent?.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                {selectedEvent?.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center mb-2">
                            <User className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Receiver:</span>
                            <span className="ml-2 text-gray-300">{selectedEvent?.title}</span>
                        </div>
                        <div className="flex items-center mb-4">
                            <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Amount:</span>
                            <span className="ml-2 text-gray-300">{selectedEvent?.amount} {selectedEvent?.currency}</span>
                        </div>
                        <p><strong>Signatures:</strong> {signatures.length} / {threshold as number}</p>
                        <p>
                            <strong>Signed By:</strong>
                            {signerAddress.length > 0 ? '' : 'No signers'}
                        </p>
                        {signerAddress.length > 0 && (
                            <p>
                                {signerAddress.join(', ')}
                            </p>
                        )}



                        {/* <p className="font-semibold">
                            Signatures: {selectedEvent?.currentSignatures} / {selectedEvent?.requiredSignatures}
                        </p> */}
                        {/* <div className="mt-2">
                            {selectedEvent?.signers.map((signer, index) => (
                                <span key={index} className="inline-block bg-[#2c2c2c] rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2 mb-2">
                                    {signer}
                                </span>
                            ))}
                        </div> */}
                    </div>
                    <DialogFooter>
                        {!signerAddress.includes(address as string) ? (
                            <Button
                                className="bg-transparent text-accent border border-accent hover:bg-accent hover:text-black"
                                onClick={() => signTransaction(selectedEvent as any)}
                            >
                                Sign Transaction
                            </Button>
                        ) : (
                            <span>Approval Given</span>
                        )}
                        {!selectedEvent?.executed ?
                            (<Button className="bg-accent text-black hover:bg-accent disabled:bg-gray-600 disabled:text-gray-400"
                                onClick={() => executeTransaction(selectedEvent as any)}>

                                Execute Transaction
                            </Button>)
                            : (
                                <span>Executed</span>)}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface ToolbarProps {
    date: Date;
    view: View;
    views: View[];
    label: string;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    onView: (view: View) => void;
}

const CustomToolbar: React.FC<ToolbarProps> = ({
    view,
    views,
    label,
    onNavigate,
    onView
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 text-white">
            <div className="flex space-x-2 mb-2 md:mb-0">
                <Button variant="outline" size="sm" onClick={() => onNavigate('PREV')} className="text-white bg-transparent border-[#2c2c2c] hover:bg-[#2c2c2c]">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onNavigate('NEXT')} className="text-white bg-transparent border-[#2c2c2c] hover:bg-[#2c2c2c]">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <h2 className="text-xl font-semibold mb-2 md:mb-0">{label}</h2>
            <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')} className="text-white bg-transparent border-border-light">
                    Today
                </Button>
                <Select onValueChange={(value) => onView(value as View)} value={view}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent className='bg-dark-gray'>
                        <SelectItem value="day" className='bg-dark-gray text-accent'>Day</SelectItem>
                        <SelectItem value="month" className='bg-dark-gray text-accent'>Month</SelectItem>
                        <SelectItem value="week" className='bg-dark-gray text-accent'>Weekly</SelectItem>
                        <SelectItem value="agenda" className='bg-dark-gray text-accent'>Agenda</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

interface CustomEventProps {
    event: CalendarEvent;
}

const CustomEvent: React.FC<CustomEventProps> = ({ event }) => {
    return (
        <div className="text-xs p-1 bg-accent text-black">
            <div className="font-semibold">{event.title}</div>
            <div>{event.amount} {event.currency}</div>
        </div>
    )
}