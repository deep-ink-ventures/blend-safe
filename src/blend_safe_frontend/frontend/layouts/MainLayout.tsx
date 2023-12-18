import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import logo from '../svg/logo.svg';
import plus from '../svg/plus.svg';

interface IMainProps {
  title: string;
  description: string;
  canonical?: string;
  siteName?: string;
  children: ReactNode;
}

/**
 *
 * @param meta
 * @param children
 * @returns
 */
export const MainLayout = (props: IMainProps) => {
  const navigate = useNavigate();

  const handleCreateNewAccount = () => {
    navigate('/account/create');
  };

  return (
    <>
      <div className='flex flex-wrap justify-between bg-base-200 py-4 drop-shadow-sm'>
        <div className='mx-auto flex w-full max-w-screen-xl items-center px-6 align-middle '>
          <div className='flex items-center justify-center align-middle '>
            <Link href='/'>
              {/* <div className='mask mask-diamond bg-primary p-4'> */}
              <Image
                src={logo}
                width={40}
                height={40}
                alt='Blendsafe logo'
                className=''
              />
              {/* </div> */}
            </Link>
            <h2 className='m-auto pl-2 text-[20px] md:text-[24px]'>
              <Link href='/'>Blendsafe</Link>
            </h2>
          </div>

          <div className='ml-auto flex space-x-4 py-2'>
            {false && (
              <>
                <div className='m-1'>
                  <button
                    className='btn btn-primary'
                    onClick={handleCreateNewAccount}>
                    {' '}
                    <Image
                      src={plus}
                      width={17}
                      height={17}
                      alt='add one'
                      className='mr-2'
                    />
                    Create New Account
                  </button>
                </div>
              </>
            )}
            <WalletConnect text='Connect' />
          </div>
        </div>
      </div>
      <div className='m-auto max-w-screen-xl px-1'>
        {/* <Meta
          title={props.title}
          description={props.description}
          canonical={props.canonical ? props.canonical : ''}
          siteName={props.siteName ? props.siteName : 'Blendsafe'}
        /> */}
        <div className='mx-auto'>
          <div className='m-2 h-full rounded-2xl p-2'>{props.children}</div>
        </div>
      </div>
    </>
  );
};
