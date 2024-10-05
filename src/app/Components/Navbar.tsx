import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  return (
    <motion.nav
      className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between relative shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Side */}
      <motion.div
        className="text-xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link href="/" className="hover:text-blue-400">ORBIT</Link>
      </motion.div>

      {/* Centered Link */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/wallet"
          className="text-white font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 shadow-lg">
          Dashboard
        </Link>
        
      </motion.div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ConnectButton />
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
