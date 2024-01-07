import cn from "classnames";
import { useState } from "react";

import Logout from "../svg/components/Logout";

import { ConnectButton, useConnect } from "@connect2ic/react";
import React from "react";
import Chevron from "../svg/components/Chevron";
import Wallet from "../svg/components/Wallet";

interface WalletConnectProps {
  text: string;
  onClose?: () => void;
}

const WalletConnect = (props: WalletConnectProps) => {
  const { isConnected, activeProvider, disconnect } = useConnect();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // const handleOpenModal = () => {
  //   updateIsConnectModalOpen(!isConnectModalOpen);
  // };

  const handleDropDown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleModalOpen = () => {
    // connect();
  };

  const handleDisconnect = () => {
    // updateCurrentWalletAccount(null);
    disconnect();
    setDropdownOpen(false);
  };

  return (
    <div className="relative flex flex-col">
      {!isConnected && <ConnectButton />}
      <button
        tabIndex={0}
        className={cn("btn btn-outline m-1", {
          loading: false,
          hidden: !isConnected,
        })}
        onClick={handleDropDown}
      >
        {activeProvider ? (
          <div className="mr-2">
            <img
              src={activeProvider.meta.icon.light}
              alt="avatar"
              height="18"
              width="18"
            />
          </div>
        ) : (
          <div
            className={cn("mr-2", {
              hidden: false,
            })}
          >
            <Wallet className="h-3 w-3 stroke-black" />
          </div>
        )}
        <span className="align-middle">
          {isConnected ? activeProvider?.meta.name : props.text}
        </span>
        {Boolean(activeProvider) && (
          <span className="ml-2">
            <Chevron direction="down" />
          </span>
        )}
      </button>
      <div
        className={cn(
          "shadow-[0_0_4px_0_rgba(255, 255, 255, 0.20)] absolute right-0 top-[65px] w-full space-y-2 rounded-2xl border-[0.5px] border-neutral bg-base-100 py-1 shadow-sm hover:bg-base-300",
          {
            hidden: !dropdownOpen,
          }
        )}
      >
        <div
          className={`group flex cursor-pointer items-center gap-2 px-4 py-2 text-sm`}
          onClick={handleDisconnect}
        >
          <Logout width={20} height={20} className="" /> Disconnect
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
