import { useCanister, useConnect } from "@connect2ic/react";
import { ErrorMessage } from "@hookform/error-message";
import cn from "classnames";
import React, { useState, type ReactNode } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import BlendSafe from "../blend_safe";
import { usePromise } from "../hooks/usePromise";
import ConnectWallet from "./ConnectWallet";

interface IImportTransactionProps {
  walletCustomId:string; 
  isVisible?: boolean;
  accountId?: string;
  children?: ReactNode;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface CreateTransactionFormValues {
  txHash: string | null;
}

const MAX_XDR_CHAR_COUNT = 4096;

const isDebug = true;

const ImportTransactionModal = (props: IImportTransactionProps) => {
  const { isVisible, accountId, onSuccess, onClose, walletCustomId } = props;
  const [canister] = useCanister("blend_safe_backend");
  const { isConnected, principal } = useConnect();

  const [t, setT] = useState<any>();

  const formMethods = useForm<CreateTransactionFormValues>({
    defaultValues: {
      txHash: null,
    },
  });

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = formMethods;

  const propose = usePromise({
    promiseFunction: async (txHash: string) => {
      try {
        const safe = new BlendSafe(canister as any, walletCustomId);
        const response = await safe.propose(txHash);
        toast.success("Successfully posted a message");
        reset();
        props.onSuccess && props.onSuccess();
        return response;
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const onSubmit: SubmitHandler<CreateTransactionFormValues> = async (data) => {
    if (data.txHash) {
      await propose.call(data.txHash);
    }
  };

  const testGenerateTransactionHash = async () => {
    const safe = new BlendSafe(canister as any, walletCustomId);
    const AMOUNT_IN_ETHER = `0.00000${Math.floor(
      Math.random() * (999 - 100 + 1) + 100
    )}`;
    const GAS = 2100000000;
    const CHAIN_ID = 5; // goerli
    const walletAddress = await safe.getEthAddress();
    const transaction = {
      to: "0x5Ac014CB02e290562e608A94C1f5033Ea54e9243",
      value: safe.web3.utils.toHex(
        safe.web3.utils.toWei(AMOUNT_IN_ETHER, "ether")
      ),
      gas: safe.web3.utils.toHex(GAS),
      gasPrice: safe.web3.utils.toHex(await safe.web3.eth.getGasPrice()),
      nonce: safe.web3.utils.toHex(
        await safe.web3.eth.getTransactionCount(walletAddress)
      ),
      chainId: CHAIN_ID,
    };
    const txTest = safe.getEthTransactionHashFromTransactionObject(
      transaction,
      CHAIN_ID
    );
    setT(txTest);
  };

  const txHashWatch = watch("txHash");

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-[900] flex h-full w-full items-center justify-center",
        {
          hidden: !isVisible,
        }
      )}
    >
      <div
        className="absolute h-full w-full bg-black opacity-50"
        onClick={() => {
          reset();
          if (onClose) {
            onClose();
          }
        }}
      />
      <div className="z-[1050] flex flex-col items-center justify-center gap-5 rounded-lg bg-white p-4 opacity-100">
        <div className="w-full min-w-[600px] max-w-[820px] overflow-hidden">
          {isConnected ? (
            <>
              <div className="my-2 w-full text-center">
                <h1 className="text-2xl">Create transaction</h1>
                {isConnected && isDebug && (
                  <>
                    <a
                      className=""
                      onClick={() => testGenerateTransactionHash()}
                    >
                      generateTxHashForTest()
                    </a>
                    {!!t && <p>{t}</p>}
                  </>
                )}
              </div>
              <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                  <div className=" my-5 flex w-full flex-col items-center justify-around space-y-7">
                    <div className="flex flex-col items-center justify-center">
                      Enter a transaction hash to import
                    </div>
                    <div className="flex w-full flex-col justify-center">
                      <div className="w-full">
                        <div className="flex items-end justify-between">
                          <p className="mb-1 ml-2">
                            Transaction Hash{" "}
                            <span className="text-lg font-medium text-red-600">
                              *
                            </span>
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            className={cn("w-full p-2")}
                            placeholder=""
                            disabled={propose.pending}
                            {...register("txHash", {
                              required: "Required",
                              min: {
                                value: 3,
                                message: "Minimum character count is 3",
                              },
                              pattern: {
                                value: /^[0-9A-Fa-f]+$/g,
                                message: "Input is not a valid hash",
                              },
                              max: {
                                value: MAX_XDR_CHAR_COUNT,
                                message: `Maximum character count is ${MAX_XDR_CHAR_COUNT}`,
                              },
                            })}
                          />

                          <div className="mt-2 flex  hidden w-full items-center justify-between">
                            <p className="text-sm text-neutral-focus">
                              Input a base-64 encoded XDR blob
                            </p>
                            <p
                              className={` text-right opacity-60 ${
                                !txHashWatch ||
                                txHashWatch?.length > MAX_XDR_CHAR_COUNT
                                  ? "text-error-content"
                                  : null
                              }`}
                            >
                              {txHashWatch?.length}/{MAX_XDR_CHAR_COUNT}
                            </p>
                          </div>
                        </div>
                      </div>
                      <ErrorMessage
                        errors={errors}
                        name="txHash"
                        render={({ message }) => (
                          <p className="ml-2 mt-1 text-error-content">
                            {message}
                          </p>
                        )}
                      />
                    </div>
                  </div>
                  <div className="mb-3 mt-6 flex w-full justify-center">
                    <button
                      className={cn(`btn btn-primary mr-3 w-48`, {
                        loading: propose.pending,
                      })}
                      disabled={propose.pending}
                      type="submit"
                    >
                      {`${propose.pending ? "Processing" : "Submit"}`}
                    </button>
                  </div>
                </form>
              </FormProvider>
            </>
          ) : (
            <ConnectWallet />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportTransactionModal;
