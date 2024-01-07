import React from 'react';
import { IoMdAdd, IoMdClose } from 'react-icons/io';

interface MembersAndConfirmationsProps {
  onSubmit: () => void;
}

export const MembersAndConfirmations = ({
  onSubmit,
}: MembersAndConfirmationsProps) => {
  return (
    <>
      <div className='flex w-full flex-col gap-y-4 px-8 py-4'>
        <h1 className='text-center text-xl'>Members and confirmations</h1>
        <div className='mx-auto flex flex-col items-center text-center'>
          Set the members wallets of your account and how many need to confirm
          to execute a valid transaction
        </div>
        <div className='w-full space-y-6'>
          <h1 className='text-base'>Members</h1>

          <div className='flex w-full px-4'>
            <div className='flex w-full'>
              <div className='mr-3 flex w-1/3 shrink-0 flex-col'>
                <p className='pl-6 text-sm'>Your Name</p>
                <div className='flex '>
                  <div className='mr-4 flex flex-col justify-center'>1</div>
                  <input
                    type='text'
                    // placeholder='Name'
                    className='input input-primary '
                  />
                </div>
              </div>
              <div className='flex flex-auto flex-col'>
                <p className='ml-1 text-sm'>Your wallet address</p>
                <input
                  type='text'
                  placeholder='Wallet Address'
                  className='input input-primary'
                />
              </div>

              <div className='ml-3 flex items-center pt-5'>
                <IoMdClose className='text-red-600' />
              </div>
            </div>
          </div>
          <div className='w-full text-center'>
            <button className='btn btn-outline !rounded-full' type='button'>
              <IoMdAdd className='mr-2' />
              Add new member
            </button>
          </div>
        </div>

        <div className='space-y-6'>
          <h1 className='text-base'>Signing threshold</h1>
          <p className='text-sm'>
            The signing threshold is a defined level of consensus that must be
            reached in order transactions to be approved
          </p>
          <button className='btn btn-outline mt-4 w-full !rounded-lg'>1</button>
          <div className='text-center text-sm'>Out of 2 members</div>
        </div>

        <div className='mt-8 flex w-full gap-x-2'>
          <button
            className='btn btn-outline flex-1 !rounded-lg'
            onClick={onSubmit}>
            Back
          </button>
          <button
            className='btn btn-primary flex-1 !rounded-lg'
            onClick={onSubmit}>
            Next
          </button>
        </div>
      </div>
    </>
  );
};
