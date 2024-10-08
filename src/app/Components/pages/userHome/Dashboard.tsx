'use client'

import { useState } from "react"
import CalendarView from "./CalendarView"

export default function Dashboard() {
    const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar')

    return (
        <div>
            <div className="mb-4 flex space-x-2">
                <button
                    className={`rounded-lg px-4 py-2 ${activeView === 'calendar' ? 'bg-accent text-black' : 'bg-transparent border border-gray-400 hover:border-accent border-accent'
                        }`}
                    onClick={() => setActiveView('calendar')}
                >
                    Calendar View
                </button>
                <button
                    className={`rounded-lg px-4 py-2 ${activeView === 'list' ? 'bg-accent text-black' : 'bg-transparent border border-gray-400 hover:border-accent border-accent'
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
        </div>
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