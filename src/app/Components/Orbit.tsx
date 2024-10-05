"use client"
import React, { useState } from 'react';
import CreateWallet from './CreateWallet';
import ScheduleTransaction from './ScheduleTransactions';
import TransactionCalendar from './TransactionCalendar';

const OrbitApp = () => {
  const [currentPage, setCurrentPage] = useState('create');

  const renderPage = () => {
    switch(currentPage) {
      case 'create':
        return <CreateWallet />;
      case 'schedule':
        return <ScheduleTransaction />;
      case 'calendar':
        return <TransactionCalendar />;
      default:
        return <CreateWallet />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Orbit Multisig Wallet</h1>
      
      <nav className="mb-6">
        <button 
          onClick={() => setCurrentPage('create')} 
          className={`mr-4 px-4 py-2 rounded ${currentPage === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Manage Wallet
        </button>
        <button 
          onClick={() => setCurrentPage('schedule')} 
          className={`mr-4 px-4 py-2 rounded ${currentPage === 'schedule' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Schedule Transaction
        </button>
        <button 
          onClick={() => setCurrentPage('calendar')} 
          className={`px-4 py-2 rounded ${currentPage === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Transaction Calendar
        </button>
      </nav>

      {renderPage()}
    </div>
  );
};

export default OrbitApp;