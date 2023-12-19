import React, { useState } from 'react';
import {
  BasicInfoForm,
  Congratulations,
  MembersAndConfirmations,
} from '../../components';
import ConnectWallet from '../../components/ConnectWallet';
import { MainLayout } from '../../layouts/MainLayout';

const CreateAccount = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [step, setStep] = useState(1);
  return (
    <MainLayout
      title={'Blendsafe - Create Account'}
      description={'Create a new account'}>
      <div className='container mx-auto mt-5 min-w-[600px] max-w-[700px] overflow-hidden p-4'>
        <div>
          <div className='m-4 text-2xl font-semibold'>Create new account</div>
          <div className='flex flex-wrap items-center justify-center rounded-lg border bg-base-200 py-4 drop-shadow-md'>
            {!isConnected && (
              <div
                onClick={() => {
                  setIsConnected(!isConnected);
                }}>
                <ConnectWallet />
              </div>
            )}
            {isConnected && (
              <>
                {step === 1 && <BasicInfoForm onSubmit={() => setStep(2)} />}
                {step === 2 && (
                  <MembersAndConfirmations onSubmit={() => setStep(3)} />
                )}
                {step === 3 && <Congratulations />}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateAccount;
