import { useCanister } from "@connect2ic/react";
import { ErrorMessage } from "@hookform/error-message";
import React, { useEffect, useMemo } from "react";
import {
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import BlendSafe from "../blend_safe";
import { usePromise } from "../hooks/usePromise";
import { EmptyPlaceholder } from "./EmptyPlaceholder";
import { LoadingPlaceholder } from "./LoadingPlaceholder";

interface SignersFormValues {
  signers?: {
    address: string;
  }[];
}

export const SignersForm = ({
  title = "Remove Signer",
  onSubmit,
  className,
  address,
  disableRemove,
  disableAdd,
}: {
  title?: string;
  onSubmit?: (data: SignersFormValues) => void;
  className?: string;
  address: string;
  disableRemove?: boolean;
  disableAdd?: boolean;
}) => {
  const [canister] = useCanister("blend_safe_backend");

  const formMethods = useForm<SignersFormValues>();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = formMethods;

  const { fields, remove, append } = useFieldArray({
    control,
    name: "signers",
  });

  const getWallet = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, address);
      const response = await safe.getWallet();
      return response?.[0];
    },
  });

  useEffect(() => {
    getWallet.call();
  }, []);

  useEffect(() => {
    if (getWallet.fulfilled) {
      reset({
        signers: getWallet.value?.signers?.map((signer) => ({
          address: signer.toText(),
        })),
      });
    }
  }, [getWallet.fulfilled]);

  const submit: SubmitHandler<SignersFormValues> = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
    reset();
  };
  
  const signers = useMemo(() => getWallet.value?.signers?.map(signer => signer.toText().toLowerCase()), [getWallet.value]);

  if (getWallet.pending) {
    return <LoadingPlaceholder />;
  }


  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submit)} className={className}>
        <div className="flex w-full flex-col gap-y-4 px-8 py-4">
          <div>
            <h4 className="text-center">{title}</h4>
          </div>
          <div className="w-full space-y-6">
            <div className="flex w-full flex-col gap-4 px-4">
              {!fields.length && <EmptyPlaceholder label="No signers" />}
              {fields.map((field, i) => (
                <div key={field.id} className="flex w-full items-center gap-2">
                  <div className="flex w-full items-center gap-4">
                    <div>{i + 1}</div>
                    <input
                      type="text"
                      {...register(`signers.${i}.address` as any)}
                      placeholder="Wallet Address"
                      className="input input-primary"
                      disabled={
                        disableAdd ||
                        signers?.includes(field.address.toLowerCase())
                      }
                    />
                    <ErrorMessage name="signers" errors={errors} />
                  </div>
                  {((!disableRemove && i !== 0) ||
                    (disableRemove &&
                      !signers?.includes(field.address.toLowerCase()))) && (
                    <div className="flex items-center">
                      <IoMdClose
                        className="cursor-pointer text-red-600"
                        onClick={() => remove(i)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!disableAdd && (
              <div className="w-full text-center">
                <button
                  className="btn btn-outline !rounded-full"
                  onClick={() =>
                    append({
                      address: "",
                    })
                  }
                  type="button"
                >
                  <IoMdAdd className="mr-2" />
                  Add new member
                </button>
              </div>
            )}
            <div className="w-full text-right">
              <button
                className="btn btn-primary ml-auto w-fit !rounded-lg"
                type="submit"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
