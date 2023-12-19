import cn from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

interface ILoadingModalProps {
  isVisible?: boolean;
  children?: ReactNode;
}

const LoadingModal = ({ isVisible = true, children }: ILoadingModalProps) => {
  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-[900] flex h-full w-full items-center justify-center',
        {
          hidden: !isVisible,
        }
      )}>
      <div className='absolute h-full w-full bg-black opacity-50' />
      <div className='z-[1050] flex flex-col items-center justify-center gap-5 rounded-lg bg-white p-8 opacity-100'>
        {children}
      </div>
    </div>
  );
};

export default LoadingModal;
