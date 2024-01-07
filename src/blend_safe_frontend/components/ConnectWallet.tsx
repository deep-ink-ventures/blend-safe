import React from 'react';
import WalletConnect from './WalletConnect';

const ConnectWallet = () => {
  return (
    <div className='mt-1 flex flex-col justify-center gap-y-6 p-12'>
      <div className='flex w-full flex-col items-center gap-8'>
        <div className='flex-col text-center'>
          <h1 className='text-xl'>Connect Wallet</h1>
          <div className='text-lg'>Please connect your wallet to continue</div>
        </div>

        <WalletConnect text='Connect Wallet' />
        <a
          href='#'
          target='_blank'
          className='underline'>{`Help, I don't have a wallet`}</a>
      </div>
    </div>
  );
};

export default ConnectWallet;
