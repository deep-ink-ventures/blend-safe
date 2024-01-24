import React from "react";
import { useFormContext } from "react-hook-form";
import { truncateMiddle } from '../utils'
import { IoMdInformationCircleOutline } from "react-icons/io";

interface BasicInfoFormProps {
  onSubmit: () => void;
}

export interface BasicFormValues {
  id: string;
}

export const BasicInfoForm = ({ onSubmit }: BasicInfoFormProps) => {
  const { register, getValues } = useFormContext();

  return (
    <div className="flex flex-col items-center gap-y-4 px-8 py-4">
      <h1 className="text-center text-xl">Let&apos;s get started!</h1>
      <div className="mx-auto flex flex-col items-center text-center">
        Input account name and ID number.
        <div className="w-2/3">
          Please choose wisely, your account will hopefully stick with this name
          for a while
        </div>
      </div>
      <div className="flex w-full items-center gap-x-2 rounded-lg bg-info p-4">
        <IoMdInformationCircleOutline className="text-2xl" />
        <div className="text-sm">
          Once you successfully created an account,
          <span className="font-bold">{" the 10 DOTS "}</span>
          tokens will be <span className="font-bold">{" reserved "}</span>. You
          will get them back if you destroy your account.
        </div>
      </div>
      <div className="w-full space-y-6">
        {/* <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <div>Name</div>
            <div className='text-xs'>Required</div>
          </div>
          <input className='input'></input>
          <div className='text-sm'>Name cannot be changed after creation</div>
        </div> */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>ID</div>
            <div className="text-xs">Required</div>
          </div>
          <input
            {...register("id")}
            disabled
            className="input"
          ></input>
          <div className="text-sm">
            Create a unique ID with 8 characters, choose from a combination
            letters A-z and numbers 0-9 to represent the account name.
          </div>
        </div>
      </div>
      <button
        className="btn btn-primary mt-4 w-full !rounded-lg"
        onClick={onSubmit}
      >
        Proceed
      </button>
    </div>
  );
};
