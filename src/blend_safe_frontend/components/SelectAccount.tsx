import { useState } from "react";

import { useConnect } from "@connect2ic/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "../../declarations/blend_safe_backend/blend_safe_backend.did";
import AccountCards from "./AccountCards";

const SelectAccount = ({ wallets, walletAddress }: { wallets?: string[] | null; walletAddress: string }) => {
  const [, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { isConnected, principal } = useConnect();

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      {/* <div className="mb-5 text-lg">
        {`You are a signer of these accounts:`}{" "}
      </div> */}
      <div className="flex w-[480px] flex-col items-center justify-center">
        {/* <input
          id="search-input"
          className="input input-primary mb-5 w-full text-sm"
          placeholder="Search for account name or address"
          onChange={handleSearch}
        /> */}
        <AccountCards
          walletAddress={walletAddress}
          wallets={wallets}
          onClick={(wallet) => navigate(`/account/${wallet}`)}
        />
      </div>
    </div>
  );
};

export default SelectAccount;
