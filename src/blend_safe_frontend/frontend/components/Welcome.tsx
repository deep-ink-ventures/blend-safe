import Image from 'next/image';
import plus from '../svg/plus.svg';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import SelectAccount from './SelectAccount';

const Welcome = () => {
  const navigate = useNavigate();
  const handleCreateNewAccount = () => {
    navigate('/account/create');
  };

  return (
    <div className='flex flex-col items-center justify-center p-3'>
      <div className='my-3'>
        <h1 className='text-xl'>Welcome to Blendsafe</h1>
      </div>

      <div className='my-5 flex w-full flex-col items-center justify-around space-y-7'>
        <div className='flex flex-col items-center justify-center'>
          <button className='btn btn-primary' onClick={handleCreateNewAccount}>
            <Image
              src={plus}
              width={17}
              height={17}
              alt='add one'
              className='mr-2'
            />
            Create New Account
          </button>
        </div>
        <SelectAccount />
      </div>
    </div>
  );
};

export default Welcome;
