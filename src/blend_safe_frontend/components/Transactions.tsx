import { useConnect } from "@connect2ic/react";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { IoMdCopy } from "react-icons/io";
import { toast } from "react-toastify";
import { CHAINS } from "../config";
import { useSafe } from "../context/Safe";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import { usePromise } from "../hooks/usePromise";
import Search from "../svg/components/Search";
import Spinner from "../svg/components/Spinner";
import { formatDateTime, truncateMiddle } from "../utils";
import {
  Accordion,
  EmptyPlaceholder,
  LoadingPlaceholder,
  Modal,
  Timeline,
  TransactionBadge,
  UserTally,
} from "./index";

interface ITransactionsProps {
  address?: string;
  getMessagesWithSigners?: any;
  walletCustomId?: string;
}

enum TransactionStatus {
  NA = "NA",
  Invalid = "INVALID",
  Valid = "VALID",
}

const StatusBadgeMap: Record<TransactionStatus, string> = {
  [TransactionStatus.Valid]: "VALID",
  [TransactionStatus.Invalid]: "INVALID",
  [TransactionStatus.NA]: "N/A",
};

const StatusBadgeTextMap: Record<TransactionStatus, string> = {
  [TransactionStatus.Valid]: "Metadata Valid",
  [TransactionStatus.Invalid]: "Metadata Invalid",
  [TransactionStatus.NA]: "No Metadata",
};

const AccordionHeaderColorMap: Record<TransactionStatus, string> = {
  [TransactionStatus.Valid]: "success",
  [TransactionStatus.Invalid]: "danger",
  [TransactionStatus.NA]: "warning",
};

const StatusStepMap: Record<string, number> = {
  REJECTED: 0,
  PENDING: 1,
  EXECUTABLE: 2,
  EXECUTED: 3,
};

const Transactions: React.FC<ITransactionsProps> = ({
  getMessagesWithSigners,
  walletCustomId = "",
}) => {
  const [, setSearchTerm] = useState<string>("");
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [signTxHash, setSignTxHash] = useState<string | null>();
  const { principal } = useConnect();
  const { safe } = useSafe();
  const { textRef, copyToClipboard } = useCopyToClipboard<HTMLDivElement>();

  const getWallet = usePromise<string[]>({
    promiseFunction: async () => {
      const response = await safe.getWallet();
      return response?.[0];
    },
  });

  const getTransaction = usePromise<any>({
    promiseFunction: async (txHash: string) => {
      const response = await safe.web3.eth.getTransactionReceipt(`0x${txHash}`);
      return response;
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (principal) {
      getWallet.call();
    }
  }, [principal]);

  useEffect(() => {
    if (getMessagesWithSigners.value?.[0]?.[0]) {
      getTransaction.call(getMessagesWithSigners.value[0]?.[0]);
    }
  }, [getMessagesWithSigners.value]);

  return (
    <>
      <div className="flex text-center">
        <div className="text-2xl font-semibold">Transactions</div>
        <div className="relative ml-auto">
          <Search className="absolute inset-y-0 left-2 my-auto h-4 w-4 fill-black" />
          <input
            className="my-auto rounded-lg px-3 py-2 pl-8 text-sm"
            placeholder="Search"
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="space-y-3">
        <>
          {getMessagesWithSigners.pending && <LoadingPlaceholder />}
          {!getMessagesWithSigners?.pending &&
            !getMessagesWithSigners?.value?.length && (
              <EmptyPlaceholder label="You don't have any transactions yet" />
            )}
          {!getMessagesWithSigners?.pending &&
            getMessagesWithSigners?.value?.map((txn: any, index: number) => {
              const txnApprovals = txn[1];
              const txnStatus =
                txnApprovals?.length < (getWallet.value?.signers?.length || 0)
                  ? "PENDING"
                  : "EXECUTABLE";
              return (
                <TransactionAccordion
                  key={index}
                  id={index}
                  activeAccordion={activeAccordion}
                  setActiveAccordion={setActiveAccordion}
                  walletCustomId={walletCustomId}
                  getMessagesWithSigners={getMessagesWithSigners}
                  txnStatus={txnStatus}
                  txn={txn}
                  getWallet={getWallet}
                  setSignTxHash={setSignTxHash}
                />
              );
            })}
        </>
      </div>
      <Modal isVisible={!!signTxHash} onClose={() => setSignTxHash(null)}>
        <Modal.Header>Message Successfully signed</Modal.Header>
        <div className="relative overflow-x-auto rounded-lg border border-gray-300 py-6 text-center">
          <span className="hidden" ref={textRef}>
            {`${signTxHash}`}
          </span>
          {truncateMiddle(`${signTxHash}`)}
          <IoMdCopy
            className="absolute right-1 top-1 cursor-pointer"
            onClick={() => {
              copyToClipboard();
              toast.success(
                `${truncateMiddle(`${signTxHash}`)} copied to clipboard`
              );
            }}
          />
        </div>
      </Modal>
    </>
  );
};

const TransactionAccordion = ({
  walletCustomId,
  getMessagesWithSigners,
  txnStatus,
  txn,
  getWallet,
  setSignTxHash,
  activeAccordion,
  setActiveAccordion,
  id,
}: {
  walletCustomId: string;
  getMessagesWithSigners: any;
  txnStatus?: string;
  txn: any;
  getWallet: any;
  setSignTxHash: any;
  activeAccordion: number | null;
  setActiveAccordion: (id: number | null) => void;
  id: number;
}) => {
  const { safe } = useSafe();

  const txnAddress = txn[0];
  const txnApprovals = txn[1];

  const { textRef, copyToClipboard } = useCopyToClipboard();

  const getMetadataForMessage = usePromise({
    promiseFunction: async (txHash: string) => {
      const response = await safe.getMetadataForMessage(txHash);
      const transactionData = JSON.parse(response || "");

      if (!transactionData?.transaction) {
        return null;
      }

      const [decodedTx, isValid] = await Promise.all([
        safe.decodeTransaction(transactionData?.transaction),
        safe.getEthTransactionHashFromTransactionObject(
          transactionData.transaction,
          transactionData.chainId
        ),
      ]);

      return {
        isValid: !!isValid,
        chainId: transactionData.chainId,
        transaction: decodedTx,
        rawMetadata: transactionData,
      };
    },
  });

  const approveTransaction = usePromise({
    promiseFunction: async (txnHash: string) => {
      try {
        const response = await safe.approve(txnHash);
        getMessagesWithSigners.call();
        toast.success("Successfully approved a message");
        return response;
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const signTransaction = usePromise({
    promiseFunction: async (txnHash: string, metadata?: any) => {
      try {
        let response;

        if (metadata.transaction) {
          response = await safe.signAndBroadcastTransaction(
            metadata.transaction,
            metadata.chainId
          );
        } else {
          response = await safe.sign(txnHash);
        }
        getMessagesWithSigners.call();
        toast.success("Successfully signed a message");
        if (typeof response === 'string') {
          setSignTxHash(response);
        } else {
          setSignTxHash(response?.transactionHash);
        }
        return response;
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const isLoading =
    signTransaction.pending ||
    getMetadataForMessage.pending ||
    approveTransaction.pending;

  const displayButtons = (status: any, txhash: string) => {
    switch (status) {
      case "EXECUTABLE":
        return (
          <div className="flex w-full justify-center">
            <button
              className={cn("btn btn-primary flex-1", {
                loading: isLoading,
              })}
              disabled={isLoading}
              onClick={() =>
                handleSignTransaction(
                  txhash,
                  decodedTransactionMetadata?.rawMetadata
                )
              }
            >
              Sign
            </button>
          </div>
        );

      case "PENDING":
        return (
          <div className="flex w-full justify-center gap-2">
            <button className="btn btn-outline hidden flex-1">Reject</button>
            <button
              className={cn("btn btn-primary flex-1", {
                loading: isLoading,
              })}
              disabled={isLoading}
              onClick={() => handleApproveTransaction(txhash)}
            >
              {approveTransaction.pending ? "Approving" : "Approve"}
            </button>
          </div>
        );

      case "EXECUTED":
        return null;

      case "REJECTED":
        return null;

      default:
        return null;
    }
  };

  const handleSignTransaction = async (txHash: string, metadata: any) => {
    await signTransaction.call(txHash, metadata);
  };

  const handleApproveTransaction = async (transaction: string) => {
    await approveTransaction.call(transaction);
  };

  const decodedTransactionMetadata = useMemo(
    () => getMetadataForMessage.value,
    [getMetadataForMessage.value]
  );

  const metadataStatus = useMemo(() => {
    if (getMetadataForMessage.rejected) {
      return TransactionStatus.NA;
    }

    if (getMetadataForMessage.fulfilled) {
      if (!!decodedTransactionMetadata) {
        if (decodedTransactionMetadata.isValid) {
          return TransactionStatus.Valid;
        } else {
          return TransactionStatus.Invalid;
        }
      }
    }
  }, [getMetadataForMessage]);

  return (
    <>
      <Accordion.Container
        key={id}
        id={id}
        onClick={() => setActiveAccordion(activeAccordion === id ? null : id)}
        color={(AccordionHeaderColorMap[metadataStatus || ""] as any) || "base"}
        expanded={id === activeAccordion}
      >
        <Accordion.Header className="flex gap-2 text-sm">
          <div className="grow font-semibold">{truncateMiddle(txnAddress)}</div>
          <UserTally
            value={txnApprovals?.length}
            over={getWallet.value?.signers?.length}
          />
          <TransactionBadge
            status={StatusBadgeMap[metadataStatus as any]}
            label={StatusBadgeTextMap[metadataStatus as any]}
          />
        </Accordion.Header>
        <Accordion.Content
          className={"flex divide-x"}
          onExpand={() => {
            if (
              !getMetadataForMessage.fulfilled &&
              !getMetadataForMessage.rejected
            ) {
              getMetadataForMessage.call(txnAddress);
            }
          }}
        >
          <div className="flex w-2/3 flex-col space-y-3 px-2 pr-4">
            {getMetadataForMessage.pending && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl py-12">
                <Spinner className="h-8 w-8 fill-card-primary text-base-300" />
              </div>
            )}
            {!getMetadataForMessage.pending && (
              <div>
                <p className="font-semibold">
                  Required Confirmations to accept new transactions:{" "}
                </p>
                {getWallet.value?.signers?.length
                  ? getWallet.value.signers.length - txnApprovals?.length
                  : "-"}
              </div>
            )}
            {decodedTransactionMetadata?.chainId && (
              <div>
                <p className="font-semibold">Chain</p>
                {
                  CHAINS.find(
                    (chain) =>
                      chain.chainId === decodedTransactionMetadata?.chainId
                  )?.network
                }
              </div>
            )}
            {!!decodedTransactionMetadata?.transaction?.to && (
              <div>
                <p className="font-semibold">Receiver</p>
                <div className="flex gap-2 items-center">
                  <span className="hidden" ref={textRef}>
                    {`${decodedTransactionMetadata.transaction.to}`}
                  </span>
                  {truncateMiddle(decodedTransactionMetadata.transaction.to)}
                  <IoMdCopy
                    className="cursor-pointer"
                    onClick={() => {
                      copyToClipboard();
                      toast.success(
                        `${truncateMiddle(
                          `${decodedTransactionMetadata.transaction.to}`
                        )} copied to clipboard`
                      );
                    }}
                  />
                </div>
              </div>
            )}
            {!!decodedTransactionMetadata?.transaction?.to && (
              <div>
                <p className="font-semibold">Amount</p>
                {Number(decodedTransactionMetadata.transaction.value) > 0 ? decodedTransactionMetadata.transaction.value : 0}
              </div>
            )}
            {txnStatus === "EXECUTED" && (
              <div>
                <p className="font-semibold">Executed at: </p>
                {formatDateTime(txn.executedAt)}
              </div>
            )}
          </div>
          <div className="grow space-y-2 px-3">
            <Timeline>
              {[
                "Created",
                `Confirmations ${txnApprovals?.length} of ${getWallet.value?.signers?.length}`,
                "Signed",
              ].map((step, stepIndex) => (
                <Timeline.Item
                  key={`${stepIndex}-${step}`}
                  {...(stepIndex <=
                    (StatusStepMap[txnStatus as any] as any) && {
                    status:
                      stepIndex === StatusStepMap[txnStatus as any]
                        ? "active"
                        : "completed",
                  })}
                >
                  {step}
                </Timeline.Item>
              ))}
            </Timeline>
            {txnStatus !== "PENDING" && txnStatus !== "EXECUTED" && (
              <div>Can be executed once threshold is reached</div>
            )}

            <div className="flex justify-center">
              {displayButtons(txnStatus, txnAddress)}
            </div>
          </div>
        </Accordion.Content>
      </Accordion.Container>
    </>
  );
};

export default Transactions;
