import { useCanister, useConnect } from "@connect2ic/react";
import cn from "classnames";
import Image from "next/image";
import type { ReactNode } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { IoMdAdd, IoMdSettings } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import BlendSafe from "../../blend_safe";
import { Avatar, Sidebar } from "../../components";
import ImportTransactionModal from "../../components/ImportTransactionModal";
import Settings from "../../components/Settings";
import Transactions from "../../components/Transactions";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import { usePromise } from "../../hooks/usePromise";
import { MainLayout } from "../../layouts";
import AvatarImage from "../../svg/avatar.svg";
import Chevron from "../../svg/components/Chevron";
import SwitchIcon from "../../svg/components/Switch";
import CopyIcon from "../../svg/copy.svg";
import { truncateMiddle } from "../../utils";

type AccountTabs = "Dashboard" | "Transactions" | "Settings";

const Account = () => {
  const params = useParams<{ address: string }>();
  const [canister] = useCanister("blend_safe_backend");
  const { principal } = useConnect();
  const navigate = useNavigate();

  const [isImportXdrVisible, setIsImportXdrVisible] = useState(false);
  const [isCreationTxOptionsMenuVisible, setIsCreationTxOptionsMenuVisible] =
    useState(false);

  const address = params?.address ?? "";

  const [currentTab, setCurrentTab] = useState<AccountTabs>("Transactions");

  const { textRef, copyToClipboard } = useCopyToClipboard<HTMLDivElement>();

  const getWallet = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, address);
      const response = await safe.getWallet();
      if (!response?.[0]) {
        navigate("/");
      }
      return response?.[0];
    },
  });

  const getEthAddress = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, address);
      const response = await safe.getEthAddress();
      return response;
    },
  });

  const getMessagesWithSigners = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, address);
      const response = await safe.getMessagesWithSigners();
      return response;
    },
  });

  const TABS: {
    icon: ReactNode;
    label: AccountTabs;
    badgeCount?: number | null;
  }[] = useMemo(
    () => [
      // {
      //   icon: <DashboardIcon className='h-4 w-4 shrink-0 fill-black' />,
      //   label: 'Dashboard',
      // },
      {
        icon: <SwitchIcon className="h-4 w-4 shrink-0 fill-black" />,
        label: "Transactions",
        badgeCount: getMessagesWithSigners?.value?.length || 0,
      },
      {
        icon: <IoMdSettings className="h-4 w-4 shrink-0 fill-black" />,
        label: "Settings",
      },
    ],
    [getMessagesWithSigners.value?.length]
  );

  const refreshTransactions = () => {
    if (principal) {
      getMessagesWithSigners.call();
      getWallet.call();
    }
  };

  useEffect(() => {
    if (principal) {
      getMessagesWithSigners.call();
      getWallet.call();
      getEthAddress.call();
    }
  }, [principal]);

  const createTxOptions = [
    {
      label: "Propose Raw Hash",
      onClick: () => setIsImportXdrVisible(true),
    },
    {
      label: "Propose Send Native Token",
    },
    {
      label: "Propose Send ERC20 Token",
    },
  ];

  return (
    <MainLayout title="Blendsafe" description="">
      <div className="flex w-full">
        <div className="w-1/4 shrink-0">
          <Sidebar>
            <Sidebar.Content>
              <Avatar src={AvatarImage} />
              {getEthAddress.value && (
                <>
                  <div className="mx-auto flex w-1/2">
                    <span className="hidden" ref={textRef}>
                      {getEthAddress.value}
                    </span>
                    <div className="inline-block grow truncate text-center">
                      {truncateMiddle(getEthAddress.value, 5, 3)}
                    </div>
                    <Image
                      src={CopyIcon}
                      height={15}
                      width={15}
                      alt="copy"
                      className="cursor-pointer"
                      onClick={() => {
                        copyToClipboard();
                        toast.success(
                          `${truncateMiddle(
                            getEthAddress.value
                          )} copied to clipboard`
                        );
                      }}
                    />
                  </div>
                </>
              )}
              <div className="flex hidden w-full items-center rounded-lg bg-base-300 p-4">
                <div className="flex-col">
                  <div className="text-xs">Owned Tokens</div>
                  <div className="font-semibold">10,000</div>
                </div>
                <Chevron className="ml-auto h-4 w-4 cursor-pointer fill-black" />
              </div>
              {/* {!currentWalletAccount?.publicKey && (
                <WalletConnect text='Connect your wallet' />
              )} */}
            </Sidebar.Content>
            <Sidebar.Menu>
              {TABS.map((tab, index) => (
                <Sidebar.MenuItem
                  key={`${index}-${tab.label}`}
                  active={currentTab === tab.label}
                  onClick={() => setCurrentTab(tab.label)}
                >
                  {tab.icon}
                  <div className="w-full grow truncate">{tab.label}</div>
                  {Boolean(tab.badgeCount) && (
                    <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-error-content p-2 text-sm text-white">
                      {tab.badgeCount}
                    </span>
                  )}
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar>
        </div>
        <div className="flex grow flex-col gap-4 p-6">
          {currentTab === "Dashboard" && <>dashboard</>}
          {currentTab === "Transactions" && (
            <Transactions
              walletCustomId={address}
              address={address?.toString()}
              getMessagesWithSigners={getMessagesWithSigners}
            />
          )}
          {currentTab === "Settings" && (
            <Settings
              address={address?.toString()}
              refreshTransactions={refreshTransactions}
              wallet={getWallet.value}
            />
          )}
        </div>
        <div className="fixed bottom-[2%] right-[2%]">
          <div className="relative">
            <div
              className={cn(
                "absolute right-0 mb-4 overflow-hidden rounded-lg bg-white opacity-0 shadow-sm transition-all ease-in-out",
                {
                  "opacity-0": !isCreationTxOptionsMenuVisible,
                  "opacity-100": isCreationTxOptionsMenuVisible,
                }
              )}
              style={{
                top: `-${createTxOptions.length * 100 - 10}%`,
              }}
            >
              {createTxOptions.map((option, i) => (
                <div
                  key={i}
                  className={cn(
                    "cursor-pointer items-center whitespace-nowrap px-4 py-2 transition-all duration-300",
                    {
                      "opacity-50": !option.onClick,
                      "hover:bg-base-300": !!option.onClick,
                    }
                  )}
                  onClick={() => {
                    if (option.onClick) {
                      option.onClick();
                    }
                    setIsCreationTxOptionsMenuVisible(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary transition ease-in-out hover:rotate-180">
              <button
                onClick={() =>
                  setIsCreationTxOptionsMenuVisible(
                    !isCreationTxOptionsMenuVisible
                  )
                }
                className="text-white"
              >
                <IoMdAdd className="text-2xl " />
              </button>
            </div>
          </div>
        </div>
        <ImportTransactionModal
          walletCustomId={address}
          isVisible={isImportXdrVisible}
          accountId={address}
          onClose={() => setIsImportXdrVisible(false)}
          onSuccess={() => {
            getMessagesWithSigners.call();
            getWallet.call();
            setIsImportXdrVisible(false);
          }}
        />
      </div>
      <ToastContainer />
    </MainLayout>
  );
};

export default Account;
