'use client'
import homeStyle from "./Styles/HomePage.module.css";
import Image from 'next/image';
import miro from '../public/images/miro.jpg'; // Adjust the path as necessary
import Lottie from "react-lottie"
import Navbar from "./Components/Navbar";

export default function Home() {

  return (
    <div className={homeStyle.container}>
      {/* <Lottie
        options={defaultOptions}
        height={50}
        width={100}
      /> */}

      <div className={homeStyle.image}>

        <p className={homeStyle.imageContent}>
          Orbit provides a <strong className="text-indigo-600">user-friendly interface</strong> that allows organizations to easily manage their finances. The <strong className="text-indigo-600">calendar feature</strong> visually displays all scheduled payments, making it straightforward to track budgets. Each transaction will include detailed information about the <strong className="text-indigo-600">recipient, amount, and purpose</strong>, so everyone stays informed. The ability for any member to <strong className="text-indigo-600">schedule multiple transactions</strong> at once minimizes the risk of missing payments.
        </p>
      </div>
    </div>
  );
}
