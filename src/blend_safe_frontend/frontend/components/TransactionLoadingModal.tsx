import React from 'react';
import Spinner from '../svg/components/Spinner';

export interface ITransactionLoadingModalProps {
  label?: string;
  description?: string;
}

const TransactionLoadingModal = ({
  label = 'Transaction Pending',
  description,
}: ITransactionLoadingModalProps) => {
  return (
    <>
      <div className='items-center justify-center'>
        <div className='flex h-full w-full flex-col items-center justify-center space-y-2'>
          <div className='text-2xl font-semibold'>{label}</div>
          {description && (
            <div className='flex w-full items-center gap-2 rounded-lg bg-base-200 p-4 text-gray-500'>
              <Spinner className='h-6 w-6 fill-card-primary text-base-300' />
              {description}
            </div>
          )}
          {!description && (
            <div className='p-6'>
              <Spinner className=' h-12 w-12 fill-card-primary text-base-300' />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionLoadingModal;
