import { ErrorMessage } from "@hookform/error-message";
import React, { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

interface SigningThresholdFormValues {
  threshold?: number;
}
export const SigningThresholdForm = ({
  threshold,
  max = 1,
  onSubmit
}: {
  threshold?: number;
  max?: number;
  onSubmit?: (data: SigningThresholdFormValues) => void;
}) => {
  const formMethods = useForm<SigningThresholdFormValues>();

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = formMethods;

  useEffect(() => {
    reset({
      threshold,
    });
  }, [threshold]);

  const submit: SubmitHandler<SigningThresholdFormValues> = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
    reset();
  };


  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex w-full flex-col gap-y-4 px-8 py-4">
          <div>
            <h4 className="text-center">Signing threshold</h4>
          </div>
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
                  value: max,
                  message: `Maximum threshold count is ${max}`,
                },
              })}
              className="mx-auto w-fit !rounded-lg px-4 py-2 text-center"
            />
            <ErrorMessage
              errors={errors}
              name="threshold"
              render={({ message }) => (
                <p className="ml-2 mt-1 text-error-content">{message}</p>
              )}
            />
            <div className="text-center text-sm">
              Out of {max} member{max > 1 ? "s" : ""}
            </div>
          </div>
          <div className="w-full text-right">
            <button
              className="btn btn-primary ml-auto w-fit !rounded-lg"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
