import type { ReactNode } from 'react';
import React from 'react';
import EmptyBox from '../svg/components/EmptyBox';

interface IEmptyPlaceholderProps {
  label?: ReactNode;
}

export const EmptyPlaceholder = ({
  label = 'No data',
}: IEmptyPlaceholderProps) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl bg-base-200 py-12'>
      <div className='rounded-full bg-white p-3'>
        <EmptyBox className='h-12 w-12 fill-black' />
      </div>
      <div>{label}</div>
    </div>
  );
};
