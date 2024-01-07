import React from 'react';
import MemberSign from '../svg/components/MemberSign';

interface IUserTally {
  value?: number;
  over?: number;
}

export const UserTally = ({ value, over }: IUserTally) => {
  return (
    <div className='flex items-center gap-1 text-xs'>
      <MemberSign className='h-3 w-3 stroke-black' />
      {`${value ?? 'N/A'} `}
      out of
      {` ${over ?? 'N/A'}`}
    </div>
  );
};
