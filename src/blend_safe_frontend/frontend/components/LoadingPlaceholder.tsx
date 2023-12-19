import type { ReactNode } from 'react';
import React from 'react';
import Spinner from '../svg/components/Spinner';

interface ILoadingPlaceholder {
  label?: ReactNode;
}

export const LoadingPlaceholder = ({
  label = 'Loading',
}: ILoadingPlaceholder) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl bg-base-200 py-12'>
      <Spinner className='h-8 w-8 fill-card-primary text-base-300' />
      <div>{label}</div>
    </div>
  );
};
