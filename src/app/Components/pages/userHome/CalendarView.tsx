'use client'
import React, { useState, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
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



const localizer = momentLocalizer(moment);

interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    description: string
    signers: string[]
    requiredSignatures: number
    currentSignatures: number
    receiver: string
    amount: string
    currency: string
}

const eventColors = {
    pending: 'bg-dark-gray text-white border-border-light',
    readyToExecute: 'bg-green-100 text-green-800 border-green-300',
    executed: 'bg-dark-gray text-white border-border-light',
}

export default function CalendarView() {
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'Transfer ETH',
            start: new Date(2024, 5, 15, 10, 0),
            end: new Date(2024, 5, 15, 11, 0),
            description: 'Monthly payment to contractor',
            signers: ['Alice', 'Bob'],
            requiredSignatures: 2,
            currentSignatures: 1,
            receiver: '0x1234...5678',
            amount: '100',
            currency: 'ETH',
        },
        {
            id: '2',
            title: 'Approve Token Spend',
            start: new Date(2024, 8, 15, 14, 0),
            end: new Date(2024, 8, 15, 15, 0),
            description: 'Approve USDC spend for Uniswap',
            signers: ['Alice', 'Bob', 'Charlie'],
            requiredSignatures: 2,
            currentSignatures: 2,
            receiver: '0xUniswap...Contract',
            amount: '1000',
            currency: 'USDC',
        },
        {
            id: '3',
            title: 'Execute Swap',
            start: new Date(2024, 6, 15, 16, 0),
            end: new Date(2024, 6, 15, 17, 0),
            description: 'Swap USDC for ETH on Uniswap',
            signers: ['Alice', 'Bob'],
            requiredSignatures: 2,
            currentSignatures: 2,
            receiver: '0xUniswap...Contract',
            amount: '1000',
            currency: 'USDC',
        },
        {
            id: '4',
            title: 'Transfer DAI',
            start: new Date(2024, 9, 15, 18, 0),
            end: new Date(2024, 9, 15, 19, 0),
            description: 'Payment for services',
            signers: ['Alice', 'Charlie'],
            requiredSignatures: 2,
            currentSignatures: 1,
            receiver: '0x5678...9012',
            amount: '500',
            currency: 'DAI',
        },
    ])
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [isAddingEvent, setIsAddingEvent] = useState(false)
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: '',
        start: new Date(),
        end: new Date(),
        description: '',
        signers: [],
        requiredSignatures: 0,
        currentSignatures: 0,
        receiver: '',
        amount: '',
        currency: '',
    })

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

    const handleAddEvent = () => {
        if (newEvent.title && newEvent.receiver && newEvent.amount && newEvent.currency) {
            setEvents([...events, { ...newEvent, id: Date.now().toString() } as CalendarEvent])
            setIsAddingEvent(false)
            setNewEvent({
                title: '',
                start: new Date(),
                end: new Date(),
                description: '',
                signers: [],
                requiredSignatures: 0,
                currentSignatures: 0,
                receiver: '',
                amount: '',
                currency: '',
            })
        }
    }

    const handleSignEvent = () => {
        if (selectedEvent) {
            const updatedEvent = {
                ...selectedEvent,
                currentSignatures: selectedEvent.currentSignatures + 1,
            }
            setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e))
            setSelectedEvent(updatedEvent)
        }
    }

    const handleExecuteTransaction = () => {
        if (selectedEvent) {
            const updatedEvent = {
                ...selectedEvent,
                currentSignatures: selectedEvent.requiredSignatures,
            }
            setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e))
            setSelectedEvent(updatedEvent)
            console.log('Executing transaction:', updatedEvent)
        }
    }

    const eventStyleGetter = useCallback(
        (event: CalendarEvent) => {
            let style = ''
            if (event.currentSignatures === event.requiredSignatures) {
                style = eventColors.readyToExecute
            } else if (event.currentSignatures > 0) {
                style = eventColors.pending
            } else {
                style = eventColors.executed
            }
            return {
                className: `${style} rounded-lg border shadow-sm`,
                style: {
                    border: '1px solid',
                },
            }
        },
        []
    )

    const { components, defaultView } = useMemo(() => ({
        components: {
            toolbar: CustomToolbar,
            event: CustomEvent,
        },
        defaultView: Views.MONTH,
    }), [])

    return (
        <div className="h-screen py-4 bg-dark-black text-white">
            <style jsx global>{`
        .rbc-calendar {
          background-color: #1E1E1E;
          border-radius: 8px;
          overflow: hidden;
          padding:20px;
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
        .rbc-day-slot .rbc-time-slot {
          border-top: none;
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 0;
        }
        .rbc-event {
          border: none;
          padding: 0;
          background:transparent;
          border-radius:0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .rbc-event-label {
          display: none;
        }
        .rbc-event-content {
          font-size: 0.875rem;
          padding: 0;
        }
        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: none;
        }
        .rbc-time-gutter .rbc-time-slot {
          color: #6B7280;
          font-size: 0.75rem;
        }
        .rbc-day-slot .rbc-event {
          border: none;
        }
        .rbc-today {
          background-color: rgba(255, 255, 255, 0.09);
         
        }
        .rbc-off-range{
        color:#242424;  
        }
        .rbc-off-range-bg {
          background-color: #191919;
          color:#1c1c1c;
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
          th.rbc-header{
          border:1px solid #3c3c3c;
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
            <Calendar<CalendarEvent, object>
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                style={{ height: 'calc(100vh - 2rem)' }}
                eventPropGetter={eventStyleGetter}
                components={components as any}
                defaultView={defaultView}
                views={['month', 'week', 'day', 'agenda']}
                view={view} // Include the view prop
                date={date} // Include the date prop
                onView={(view) => setView(view)}
                onNavigate={(date) => {
                    setDate(new Date(date));
                }}
            />

            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E] text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Schedule New Transaction</DialogTitle>
                    </DialogHeader>
                    <NewTransaction date={newEvent.end as Date} />
                    <DialogFooter>
                        <Button onClick={handleAddEvent} className="bg-blue-600 text-white hover:bg-blue-700">Schedule Transaction</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E] text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        <DialogDescription className="text-gray-400">{selectedEvent?.description}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Time:</span>
                            <span className="ml-2 text-gray-300">
                                {selectedEvent?.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                {selectedEvent?.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center mb-2">
                            <User className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Receiver:</span>
                            <span className="ml-2 text-gray-300">{selectedEvent?.receiver}</span>
                        </div>
                        <div className="flex items-center mb-4">
                            <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Amount:</span>
                            <span className="ml-2 text-gray-300">{selectedEvent?.amount} {selectedEvent?.currency}</span>
                        </div>
                        <p className="font-semibold">
                            Signatures: {selectedEvent?.currentSignatures} / {selectedEvent?.requiredSignatures}
                        </p>
                        <div className="mt-2">
                            {selectedEvent?.signers.map((signer, index) => (
                                <span key={index} className="inline-block bg-[#2c2c2c] rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2 mb-2">
                                    {signer}
                                </span>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSignEvent} disabled={selectedEvent?.currentSignatures === selectedEvent?.requiredSignatures} className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400">
                            Sign Transaction
                        </Button>
                        <Button onClick={handleExecuteTransaction} disabled={selectedEvent?.currentSignatures !== selectedEvent?.requiredSignatures} className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400">
                            Execute Transaction
                        </Button>
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
                <Select onValueChange={(value) => onView(value as View)} defaultValue={view}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent className='bg-dark-gray'>
                        <SelectItem value="day" className='bg-dark-gray text-accent'>Day</SelectItem>
                        <SelectItem value="month" defaultChecked className='bg-dark-gray text-accent'>Month</SelectItem>
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