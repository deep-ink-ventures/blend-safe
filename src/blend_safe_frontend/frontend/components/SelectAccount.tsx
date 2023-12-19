import { useState } from 'react';

import React from 'react';
import AccountCards from './AccountCards';

const SelectAccount = () => {
  const [, setSearchTerm] = useState('');

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className='flex flex-col items-center justify-center '>
      <div className='mb-5 text-lg'>
        {`You are a signer of these accounts:`}{' '}
      </div>
      <div className='flex w-[480px] flex-col items-center justify-center'>
        <input
          id='search-input'
          className='input input-primary mb-5 w-full text-sm'
          placeholder='Search for account name or address'
          onChange={handleSearch}
        />
        <AccountCards accounts={[]} />
      </div>
    </div>
  );
};

export default SelectAccount;
