import { useConnect } from "@connect2ic/react";
import { ErrorMessage } from "@hookform/error-message";
import cn from "classnames";
import React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import ReactSelect from "react-select";
import { toast } from "react-toastify";
import { CHAINS } from "../config";
import { useSafe } from "../context/Safe";
import { usePromise } from "../hooks/usePromise";
import { isValidAddress } from "../utils";
import { RequiredProperty } from "../utils/transformer";
import ConnectWallet from "./ConnectWallet";

interface ProposeSendErc20TokenProps {
  isVisible?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface ProposeSendErc20TokenFormValues {
  receiver: string | null;
  amount: number | null;
  targetChain?: number | null;
  decimals?: number | null;
  tokenAddress?: string | null;
}

const ProposeSendErc20TokenModal = (props: ProposeSendErc20TokenProps) => {
  const { isVisible, onClose } = props;
  const { isConnected } = useConnect();
  const { safe } = useSafe();

  const formMethods = useForm<ProposeSendErc20TokenFormValues>({
    defaultValues: {
      receiver: null,
      amount: null,
      targetChain: null,
    },
  });

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = formMethods;

  const proposeSendErc20Token = usePromise({
    promiseFunction: async (
      data: RequiredProperty<ProposeSendErc20TokenFormValues>
    ) => {
      try {
        const transaction = await safe.prepareERC20Transfer(
          data.tokenAddress,
          data.receiver,
          data.amount.toString(),
          data.decimals
        );

        const txHash = await safe.getEthTransactionHashFromTransactionObject(
          transaction,
          data.targetChain
        );

        const metadata = {
          transaction,
          chainId: data.targetChain,
        };

        const proposeWithMetadata = await safe.proposeWithMetadata(
          txHash,
          JSON.stringify(metadata)
        );

        toast.success("Successfully posted a message");
        reset();
        props.onSuccess && props.onSuccess();
        return proposeWithMetadata;
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const onSubmit: SubmitHandler<ProposeSendErc20TokenFormValues> = async (
    data
  ) => {
    proposeSendErc20Token.call(
      data as RequiredProperty<ProposeSendErc20TokenFormValues>
    );
  };

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
        <div className="w-full min-w-[600px] max-w-[820px]">
          {isConnected ? (
            <>
              <div className="my-3 w-full text-center">
                <h1 className="text-2xl">Propose Send ERC20 Token</h1>
              </div>
              <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                  <div className=" my-5 flex w-full flex-col items-center justify-around space-y-7">
                    <div className="flex w-full flex-col justify-center">
                      <div className="w-full">
                        <div className="flex items-end justify-between">
                          <p className="mb-1 ml-2">
                            Receiver{" "}
                            <span className="text-lg font-medium text-red-600">
                              *
                            </span>
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            className={cn("w-full p-2")}
                            placeholder=""
                            disabled={proposeSendErc20Token.pending}
                            {...register("receiver", {
                              required: "Required",
                              validate: (value) => {
                                return Boolean(value && isValidAddress(value)) || 'Invalid ETH address'
                              }
                            })}
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        errors={errors}
                        name="receiver"
                        render={({ message }) => (
                          <p className="ml-2 mt-1 text-error-content">
                            {message}
                          </p>
                        )}
                      />
                    </div>

                    <div className="flex w-full flex-col justify-center">
                      <div className="w-full">
                        <div className="flex items-end justify-between">
                          <p className="mb-1 ml-2">
                            Token address{" "}
                            <span className="text-lg font-medium text-red-600">
                              *
                            </span>
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            className={cn("w-full p-2")}
                            placeholder=""
                            disabled={proposeSendErc20Token.pending}
                            {...register("tokenAddress", {
                              required: "Required",
                              validate: (value) => {
                                return Boolean(value && isValidAddress(value)) || 'Invalid ETH address'
                              }
                            })}
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        errors={errors}
                        name="tokenAddress"
                        render={({ message }) => (
                          <p className="ml-2 mt-1 text-error-content">
                            {message}
                          </p>
                        )}
                      />
                    </div>

                    <div className="flex w-full flex-col justify-center">
                      <div className="w-full">
                        <div className="flex items-end justify-between">
                          <p className="mb-1 ml-2">
                            Token amount{" "}
                            <span className="text-lg font-medium text-red-600">
                              *
                            </span>
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            className={cn("w-full p-2")}
                            placeholder=""
                            type="number"
                            disabled={proposeSendErc20Token.pending}
                            {...register("amount", {
                              required: "Required",
                            })}
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        errors={errors}
                        name="amount"
                        render={({ message }) => (
                          <p className="ml-2 mt-1 text-error-content">
                            {message}
                          </p>
                        )}
                      />
                    </div>

                    <div className="flex w-full flex-col justify-center">
                      <div className="w-full">
                        <div className="flex items-end justify-between">
                          <p className="mb-1 ml-2">
                            Token decimals{" "}
                            <span className="text-lg font-medium text-red-600">
                              *
                            </span>
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            className={cn("w-full p-2")}
                            placeholder=""
                            type="number"
                            onKeyPress={(event) => {
                              if (!/[0-9]/.test(event.key)) {
                                event.preventDefault();
                              }
                            }}
                            disabled={proposeSendErc20Token.pending}
                            {...register("decimals", {
                              required: "Required",
                              max: {
                                value: 18,
                                message: "Maximum valid decimal is 18",
                              },
                              min: {
                                value: 0,
                                message: "Minimum valid decimal is 0",
                              },
                            })}
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        errors={errors}
                        name="decimals"
                        render={({ message }) => (
                          <p className="ml-2 mt-1 text-error-content">
                            {message}
                          </p>
                        )}
                      />
                    </div>

                    <div className="flex w-full flex-col justify-center">
                      <div className="w-full">
                        <div className="flex items-end justify-between">
                          <p className="mb-1 ml-2">
                            Target Chain{" "}
                            <span className="text-lg font-medium text-red-600">
                              *
                            </span>
                          </p>
                        </div>
                        <div className="relative">
                          <ReactSelect
                            className="w-full p-2"
                            options={CHAINS.map((chain) => ({
                              label: chain.network,
                              value: chain.chainId,
                            }))}
                            isDisabled={proposeSendErc20Token.pending}
                            onChange={(option) =>
                              setValue("targetChain", option?.value)
                            }
                          />
                        </div>
                      </div>
                      <ErrorMessage
                        errors={errors}
                        name="targetChain"
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
                        loading: proposeSendErc20Token.pending,
                      })}
                      disabled={proposeSendErc20Token.pending}
                      type="submit"
                    >
                      {`${
                        proposeSendErc20Token.pending ? "Processing" : "Propose"
                      }`}
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

export default ProposeSendErc20TokenModal;
