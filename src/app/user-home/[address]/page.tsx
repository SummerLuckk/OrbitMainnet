
import dynamic from "next/dynamic";
import React from "react";


const MainComponent = dynamic(() => import("@/app/Components/pages/userHome/MainComponent"))

const Page = () => {
    return (
        <div>
            <MainComponent />
        </div>
    );
};

export default Page;



