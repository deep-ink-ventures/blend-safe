import { useReducer } from "react";

type ActionType =
  | "PROPOSE_SEND_NATIVE_TOKEN"
  | "PROPOSE_SEND_RAW_TRANSACTION"
  | "HIDE_ALL_MODALS";

type State = {
  isSendNativeTokenVisible: boolean;
  isSendRawTransactionVisible: boolean;
};

type Action = {
  type: ActionType;
};

const modalReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "PROPOSE_SEND_NATIVE_TOKEN":
      return {
        isSendNativeTokenVisible: true,
        isSendRawTransactionVisible: false,
      };
    case "PROPOSE_SEND_RAW_TRANSACTION":
      return {
        isSendRawTransactionVisible: true,
        isSendNativeTokenVisible: false,
      };
    case "HIDE_ALL_MODALS":
      return {
        isSendRawTransactionVisible: false,
        isSendNativeTokenVisible: false,
      };
    default:
      return state;
  }
};

export const useModalManager = () => {
  const [state, dispatch] = useReducer(modalReducer, {
    isSendRawTransactionVisible: false,
    isSendNativeTokenVisible: false,
  });

  const showSendNativeToken = () =>
    dispatch({ type: "PROPOSE_SEND_NATIVE_TOKEN" });
  const showSendRawTransaction = () =>
    dispatch({ type: "PROPOSE_SEND_RAW_TRANSACTION" });
  const hideAllModals = () => dispatch({ type: "HIDE_ALL_MODALS" });

  return {
    showSendNativeToken,
    showSendRawTransaction,
    hideAllModals,
    state,
  };
};
