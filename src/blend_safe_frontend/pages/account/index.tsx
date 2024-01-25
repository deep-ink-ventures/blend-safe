import { useCanister, useConnect } from "@connect2ic/react";
import Image from "next/image";
import type { ReactNode } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import BlendSafe from "../../blend_safe";
import { Avatar, LoadingPlaceholder, Sidebar } from "../../components";
import ImportTransactionModal from "../../components/ImportTransactionModal";
import Transactions from "../../components/Transactions";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import { usePromise } from "../../hooks/usePromise";
import { MainLayout } from "../../layouts";
import AvatarImage from "../../svg/avatar.svg";
import Chevron from "../../svg/components/Chevron";
import SwitchIcon from "../../svg/components/Switch";
import CopyIcon from "../../svg/copy.svg";
import { truncateMiddle } from "../../utils";

type AccountTabs = "Dashboard" | "Transactions";

const Account = () => {
  const params = useParams<{ address: string }>();
  const [canister] = useCanister("blend_safe_backend");
  const { isConnected, principal } = useConnect();

  const [isImportXdrVisible, setIsImportXdrVisible] = useState(false);

  const { address } = params;

  const [currentTab, setCurrentTab] = useState<AccountTabs>("Transactions");

  const { textRef, copyToClipboard } = useCopyToClipboard<HTMLDivElement>();

  const getWallet = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, principal.substring(4));
      const response = await safe.getWallet();
      return response?.[0];
    },
  });

  const getMessagesWithSigners = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, principal.substring(4));
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
        badgeCount: getWallet.value?.message_queue?.length || 0,
      },
    ],
    [getWallet.value?.message_queue]
  );

  useEffect(() => {
    if (principal) {
      getWallet.call();
      getMessagesWithSigners.call();
    }
  }, [principal]);

  return (
    <MainLayout title="Blendsafe" description="">
      <div className="flex w-full">
        <div className="w-1/4 shrink-0">
          <Sidebar>
            <Sidebar.Content>
              <Avatar src={AvatarImage} />
              {getWallet.pending && <LoadingPlaceholder />}
              {address && getWallet.value && !getWallet.pending && (
                <>
                  <div className="mx-auto flex w-1/2">
                    <span className="hidden" ref={textRef}>
                      {address}
                    </span>
                    <div className="inline-block grow truncate text-center">
                      {truncateMiddle(address, 5, 3)}
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
                          `${truncateMiddle(address)} copied to clipboard`
                        );
                      }}
                    />
                  </div>
                  <div className="flex hidden w-full items-center rounded-lg bg-base-300 p-4">
                    <div className="flex-col">
                      <div className="text-xs">Owned Tokens</div>
                      <div className="font-semibold">10,000</div>
                    </div>
                    <Chevron className="ml-auto h-4 w-4 cursor-pointer fill-black" />
                  </div>
                </>
              )}
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
              address={address?.toString()}
              getMessagesWithSigners={getMessagesWithSigners}
            />
          )}
        </div>
        <div className="fixed bottom-[2%] right-[2%]">
          <div className="flex  h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary transition ease-in-out hover:rotate-180">
            <button
              onClick={() => setIsImportXdrVisible(true)}
              className="text-white"
            >
              <IoMdAdd className="text-2xl " />
            </button>
          </div>
        </div>
        <ImportTransactionModal
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
