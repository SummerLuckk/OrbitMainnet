import React from "react";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "./Components/Navbar";
import "react-toastify/dist/ReactToastify.css";

const dm_sans = DM_Sans({
  weight: ["400", "600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Orbit Wallet",
  description: "Keeping Financial Matters in Motion",
};
const Providers = dynamic(() => import("@/app/provider"), { ssr: false });
const ProgressProvider = dynamic(() => import("@/app/progressProvider"), {
  ssr: false,
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={dm_sans.variable}>
      <head>
        <title></title>
      </head>
      <body>
        <ProgressProvider>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </ProgressProvider>
      </body>
    </html>
  );
}
