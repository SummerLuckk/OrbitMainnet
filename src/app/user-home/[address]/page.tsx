
import dynamic from "next/dynamic";
import React from "react";

interface PageProps {
    params: {
        address: string; // Explicitly define the shape of the params object
    };
}

const MainComponent = dynamic(() => import("@/app/Components/pages/userHome/MainComponent"))

const Page = ({ params }: PageProps) => {
    console.log(params); // Logs the dynamic address part of the URL

    return (
        <div>
            <MainComponent contractAddress={params.address as `0x${string}`} />
        </div>
    );
};

export default Page;



