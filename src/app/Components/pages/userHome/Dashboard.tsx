'use client'

import { useState } from "react"
import CalendarView from "./CalendarView"

interface dashboardProps {
    balance: string | null;
}

export default function Dashboard({ balance }: dashboardProps) {
    const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar')
    console.log("balance in dashboard", balance);
    return (
        <>
            <div className="mb-4 flex space-x-2">
                <button
                    className={`text-sm md:textmd rounded-lg px-2 py-1 md:px-4 md:py-2 ${activeView === 'calendar' ? 'bg-accent text-black' : 'bg-transparent border border-gray-400 hover:border-accent border-accent'
                        }`}
                    onClick={() => setActiveView('calendar')}
                >
                    Calendar View
                </button>
                <button
                    className={`text-sm md:textmd rounded-lg px-2 py-1 md:px-4 md:py-2 ${activeView === 'list' ? 'bg-accent text-black' : 'bg-transparent border border-gray-400 hover:border-accent border-accent'
                        }`}
                    onClick={() => setActiveView('list')}
                >
                    List View
                </button>
            </div>
            {activeView === 'calendar' ? (
                <CalendarView />
            ) : (
                // <ListView transactions={transactions} />
                null
            )}
        </>
    )
}

// function ListView({ transactions }: { transactions: Transaction[] }) {
//     return (
//         <div className="space-y-4">
//             {transactions.map((transaction) => (
//                 <div key={transaction.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
//                     <div>
//                         <p className="font-semibold">{transaction.type === 'send' ? 'Sent' : 'Received'}</p>
//                         <p className="text-sm text-gray-400">{transaction.date.toLocaleDateString()}</p>
//                     </div>
//                     <div>
//                         <p className={`font-bold ${transaction.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
//                             {transaction.type === 'send' ? '-' : '+'}{transaction.amount} ETH
//                         </p>
//                         <p className="text-sm text-gray-400">{transaction.address}</p>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     )
// }