import { useConnect } from "@connect2ic/react";
import { ErrorMessage } from "@hookform/error-message";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IoMdAdd, IoMdClose } from "react-icons/io";

interface MembersAndConfirmationsProps {
  onSubmit: () => void;
  onBack: () => void;
}

export interface MembersAndConfirmationsFormValues {
  members?: {
    member: string;
  }[];
  threshold?: number;
}

export const MembersAndConfirmations = ({
  onSubmit,
  onBack,
}: MembersAndConfirmationsProps) => {
  const { principal } = useConnect();
  const {
    control,
    register,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } =
    useFieldArray<MembersAndConfirmationsFormValues>({
      name: "members",
      control,
    });

  const members = watch("members");

  useEffect(() => {
    if (!members?.[0]?.member) {
      setValue(`members.${0}.member`, principal);
    }
  }, []);

  return (
    <>
      <div className="flex w-full flex-col gap-y-4 px-8 py-4">
        <h1 className="text-center text-xl">Members and confirmations</h1>
        <div className="mx-auto flex flex-col items-center text-center">
          Set the members wallets of your account and how many need to confirm
          to execute a valid transaction
        </div>
        <div className="w-full space-y-6">
          <h1 className="text-base">Members</h1>
          {fields.map((field, i) => (
            <div key={field.id} className="flex w-full px-4">
              <div className="flex w-full items-center gap-2">
                <div className="flex w-full items-center gap-4">
                  <div>{i + 1}</div>
                  <input
                    type="text"
                    {...register(`members.${i}.member`)}
                    placeholder="Wallet Address"
                    className="input input-primary"
                    disabled={i === 0}
                  />
                  {i !== 0 && (
                    <div className="flex items-center">
                      <IoMdClose
                        className="text-red-600"
                        onClick={() => remove(i)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="w-full text-center">
            <button
              className="btn btn-outline !rounded-full"
              onClick={() =>
                append({
                  member: "",
                })
              }
              type="button"
            >
              <IoMdAdd className="mr-2" />
              Add new member
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-base">Signing threshold</h1>
          <p className="text-sm">
            The signing threshold is a defined level of consensus that must be
            reached in order transactions to be approved
          </p>
          <div className="space-y-2 text-center">
            <input
              {...register("threshold", {
                required: "Required",
                min: {
                  value: 1,
                  message: "Minimum threshold is 1",
                },
                max: {
                  value: fields.length,
                  message: `Maximum threshold count is ${fields.length}`,
                },
              })}
              className="mx-auto w-fit !rounded-lg px-4 py-2"
            />
            <ErrorMessage
              errors={errors}
              name="threshold"
              render={({ message }) => (
                <p className="ml-2 mt-1 text-error-content">{message}</p>
              )}
            />
            <div className="text-center text-sm">
              Out of {fields.length} member{fields.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full gap-x-2">
          <button
            className="btn btn-outline flex-1 !rounded-lg"
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="btn btn-primary flex-1 !rounded-lg"
            onClick={async () => {
              const isValid = await trigger();
              if (isValid) {
                onSubmit();
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
