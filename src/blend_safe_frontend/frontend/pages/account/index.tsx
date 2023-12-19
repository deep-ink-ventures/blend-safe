import Image from 'next/image';
import type { ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Sidebar } from '../../components';
import Transactions from '../../components/Transactions';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import { MainLayout } from '../../layouts';
import AvatarImage from '../../svg/avatar.svg';
import Chevron from '../../svg/components/Chevron';
import SwitchIcon from '../../svg/components/Switch';
import CopyIcon from '../../svg/copy.svg';
import { truncateMiddle } from '../../utils';

type AccountTabs = 'Dashboard' | 'Transactions';

const Account = () => {
  const params = useParams<{ address: string }>();
  const { address } = params;

  const [currentTab, setCurrentTab] = useState<AccountTabs>('Transactions');

  const { textRef, copyToClipboard } = useCopyToClipboard<HTMLDivElement>();

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
        icon: <SwitchIcon className='h-4 w-4 shrink-0 fill-black' />,
        label: 'Transactions',
        badgeCount: 0,
      },
    ],
    []
  );

  return (
    <MainLayout title='Blendsafe' description=''>
      <div className='flex w-full'>
        <div className='w-1/4 shrink-0'>
          <Sidebar>
            <Sidebar.Content>
              <Avatar src={AvatarImage} />
              {'address' && (
                <>
                  <div className='mx-auto flex w-1/2'>
                    <span className='hidden' ref={textRef}>
                      wallet address
                    </span>
                    <div className='inline-block grow truncate text-center'>
                      {truncateMiddle('wallet address', 5, 3)}
                    </div>
                    <Image
                      src={CopyIcon}
                      height={15}
                      width={15}
                      alt='copy'
                      className='cursor-pointer'
                      onClick={copyToClipboard}
                    />
                  </div>
                  <div className='flex w-full items-center rounded-lg bg-base-300 p-4'>
                    <div className='flex-col'>
                      <div className='text-xs'>Owned Tokens</div>
                      <div className='font-semibold'>10,000</div>
                    </div>
                    <Chevron className='ml-auto h-4 w-4 cursor-pointer fill-black' />
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
                  onClick={() => setCurrentTab(tab.label)}>
                  {tab.icon}
                  <div className='w-full grow truncate'>{tab.label}</div>
                  {Boolean(tab.badgeCount) && (
                    <span className='ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-error-content p-2 text-sm text-white'>
                      {tab.badgeCount}
                    </span>
                  )}
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar>
        </div>
        <div className='flex grow flex-col gap-4 p-6'>
          {currentTab === 'Dashboard' && <>dashboard</>}
          {currentTab === 'Transactions' && (
            <Transactions address={address?.toString()} />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
