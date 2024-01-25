import { useCanister, useConnect } from "@connect2ic/react";
import { Principal } from "@dfinity/principal";
import cn from "classnames";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BlendSafe from "../../blend_safe";
import {
  BasicFormValues,
  BasicInfoForm,
  Congratulations,
  LoadingPlaceholder,
  MembersAndConfirmations,
  MembersAndConfirmationsFormValues,
} from "../../components";
import ConnectWallet from "../../components/ConnectWallet";
import { usePromise } from "../../hooks/usePromise";
import { MainLayout } from "../../layouts/MainLayout";

type CreateAccountFormValues = BasicFormValues &
  MembersAndConfirmationsFormValues;

const CreateAccount = () => {
  const { isConnected, principal } = useConnect();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [canister] = useCanister("blend_safe_backend");

  const formMethods = useForm<CreateAccountFormValues>({
    defaultValues: {
      id: principal?.substring(4),
      members: [{ member: principal }],
    },
  });
  const { getValues } = formMethods;

  const createWallet = usePromise({
    promiseFunction: async (formData: CreateAccountFormValues) => {
      const principalFromText = Principal.fromText(principal);

      const safe = new BlendSafe(canister as any, principal.substring(4));

      await safe.createWallet(
        [
          principalFromText,
          ...(formData.members?.map((member) =>
            Principal.fromText(member.member)
          ) || []),
        ],
        !!formData.threshold ? Number(formData.threshold) : 1
      );
      setStep(3);
    },
  });

  const onCreateWallet = async () => {
    const formData = getValues();
    await createWallet.call(formData);
  };

  return (
    <MainLayout
      title={"Blendsafe - Create Account"}
      description={"Create a new account"}
    >
      <div className="container mx-auto mt-5 min-w-[600px] max-w-[700px] overflow-hidden p-4">
        <div>
          <div className="m-4 text-2xl font-semibold">Create new account</div>
          <FormProvider {...formMethods}>
            <div className="flex flex-wrap items-center justify-center rounded-lg border bg-base-200 py-4 drop-shadow-md">
              {!isConnected && <ConnectWallet />}
              {isConnected && (
                <>
                  {createWallet.pending && <LoadingPlaceholder />}
                  <div
                    className={cn({
                      hidden: createWallet.pending,
                    })}
                  >
                    {step === 1 && (
                      <BasicInfoForm
                        onSubmit={() => {
                          setStep(2);
                        }}
                      />
                    )}
                    {step === 2 && (
                      <MembersAndConfirmations
                        onSubmit={() => {
                          onCreateWallet();
                        }}
                        onBack={() => {
                          setStep(1);
                        }}
                      />
                    )}
                    {step === 3 && (
                      <Congratulations
                        onConfirm={() => navigate(`/account/${principal}`)}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </FormProvider>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateAccount;
