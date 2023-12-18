import React from 'react';
import { useNavigate } from 'react-router-dom';
import CongratsImage from '../svg/congrats.svg';

export const Congratulations = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className='flex flex-col items-center'>
        <img src={CongratsImage} alt='congrats' height={270} width={270} />
        <div className='space-y-2'>
          <h1 className='text-center text-xl'>Congratulations</h1>
          <div>
            <div>{'Account name '} is successfully created! </div>
            <div>You may now start using the account</div>
          </div>
        </div>

        <button
          className='btn btn-primary mt-4 w-full !rounded-lg'
          onClick={() => navigate('/account/1')}>
          Go to Dashboard
        </button>
      </div>
    </>
  );
};
