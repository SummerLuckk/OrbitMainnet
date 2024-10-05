
import React from "react";
import UserWallet from "../../Components/UserWallet";


const Page = ({ params }) => {
  console.log(params); // Logs the dynamic address part of the URL

  return (
    <div>
      <UserWallet contractAddress={params.address} />
    </div>
  );
};

export default Page;