import React from 'react';
import { Avatar } from '.';
import AvatarImage from '../svg/avatar.svg';
import MemberSign from '../svg/components/MemberSign';
import { truncateMiddle } from '../utils';

const AccountCard = ({ account }: { account: any }) => {
  return (
    <div
      // href={`/account/${account.address}`}
      className='flex w-full items-center justify-between gap-4 rounded-xl border-[0.5px] border-neutral bg-base-100 p-4 text-sm shadow-lg hover:outline hover:cursor-pointer hover:bg-base-200 hover:outline-primary'>
      <div className='flex items-center gap-2'>
        <Avatar width={45} height={45} src={AvatarImage} />
        <div>
          <p className='text-lg font-semibold'>{account.name}</p>
          <div className=''>{truncateMiddle(account.address, 5, 3)}</div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <div>
          <div className='flex items-center justify-end gap-1 text-neutral-content'>
            <MemberSign className='h-4 w-4 fill-transparent stroke-black' />
            <span className='text-base'>{`${account.signatories.length}`}</span>
          </div>
          <div className='text-sm'>Signatories</div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
