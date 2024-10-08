"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { useAccount } from "wagmi"

export default function Welcome() {

    const { address } = useAccount()
    return (<>
        {address ? <Link href="/welcome/accounts" className="bg-accent text-black font-semibold py-3 px-6 rounded max-w-max">Explore Accounts</Link>
            : <ConnectButton />
        }


    </>)
}