import React from "react";
import { Wallet } from "../../declarations/blend_safe_backend/blend_safe_backend.did";
import AccountCard from "./AccountCard";

const AccountCards = (props: {
  wallets?: Wallet[] | null;
  onClick?: (wallet?: Wallet) => void;
  walletAddress: string;
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-between space-y-2">
      {props.wallets?.map((wallet, i) => {
        return <AccountCard key={i} wallet={wallet} walletAddress={props.walletAddress} onClick={props.onClick} />;
      })}
    </div>
  );
};

export default AccountCards;
