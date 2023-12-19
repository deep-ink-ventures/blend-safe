import React from 'react';
import AccountCard from './AccountCard';

const AccountCards = (props: { accounts?: any[] }) => {
  return (
    <div className='flex w-full flex-col items-center justify-between space-y-2'>
      {props.accounts?.map((account) => {
        return <AccountCard key={account.address} account={account} />;
      })}
    </div>
  );
};

export default AccountCards;
