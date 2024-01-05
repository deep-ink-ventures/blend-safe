import cn from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

interface ConfirmationModalProps {
  visible?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

const ConfirmationModal = ({
  title,
  visible,
  onConfirm,
  onClose,
  children,
}: ConfirmationModalProps) => {
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
      <div className='z-[1050] flex flex-col items-center justify-center gap-5 rounded-lg bg-white p-8 opacity-100'>
        <div className='flex w-full min-w-[400px] flex-col justify-between'>
          <h1 className='mb-6 text-center text-2xl'>{title}</h1>
          {children}
        </div>
        <div className='mt-8 flex w-full gap-2'>
          <button className='btn flex-1 truncate' onClick={onClose}>
            Cancel
          </button>
          <button
            className='btn btn-primary flex-1 truncate'
            onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
