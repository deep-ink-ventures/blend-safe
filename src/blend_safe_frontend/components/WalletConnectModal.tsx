import cn from 'classnames';
import React, { useState } from 'react';
import freight from '../svg/freight.svg';
import rightArrow from '../svg/rightArrow.svg';

const WalletConnectModal = ({
  visible,
  onClose,
}: {
  visible?: boolean;
  onClose?: () => void;
}) => {
  const [hasFreighter, setHasFreighter] = useState(false);

  const handleWalletSelect = async () => {
    // updateIsConnectModalOpen(false);
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-[900] flex h-full w-full items-center justify-center',
        {
          hidden: !visible,
        }
      )}>
      <div
        className='absolute h-full w-full bg-black opacity-50'
        onClick={() => {
          if (onClose) {
            onClose();
          }
        }}
      />
      <div className='flex flex-col items-center justify-center text-center'>
        <div>
          <h2>Select a wallet to connect</h2>
        </div>
        <div className='my-4 flex h-[200px] w-full flex-col items-center justify-center'>
          {hasFreighter ? (
            <button
              className='btn btn-outline h-16 w-[75%] !rounded-lg'
              name={'Freighter'}
              onClick={() => handleWalletSelect()}>
              <div className='flex w-full items-center justify-between'>
                <img src={freight} height={35} width={35} alt='freight' />
                <div>{'Freighter'}</div>
                <img src={rightArrow} height={8} width={15} alt='right arrow' />
              </div>
            </button>
          ) : (
            <div className='text-xl'>
              <a
                href='https://freighter.app/'
                target='_blank'
                className='underline'>
                Please install a Wallet
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal;
