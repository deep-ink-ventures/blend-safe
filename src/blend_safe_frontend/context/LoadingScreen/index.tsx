import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer } from 'react';
import LoadingModal from '../../components/LoadingModal';
import SignatureLoading from '../../components/SignatureLoadingModal';
import TransactionLoadingModal from '../../components/TransactionLoadingModal';
import type { IAction } from './reducer';
import reducer, { LoadingScreenModal } from './reducer';

const initialState = {
  isVisible: false,
  modal: null,
  modalProps: null,
};

export interface LoadingScreenControllerState {
  setAction: (action: IAction) => void;
}

export const LoadingScreenControllerContext = createContext<
  LoadingScreenControllerState | undefined
>(undefined);

export const useLoadingScreenContext = () => {
  const context = useContext(LoadingScreenControllerContext);

  if (!context) {
    throw new Error(
      'component should be used within LoadingScreenProvider component'
    );
  }

  return context;
};

export const LoadingScreenController = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const trigger = (action: IAction) => {
    dispatch(action);
  };

  return (
    <>
      <LoadingScreenControllerContext.Provider
        value={{
          setAction: trigger,
        }}>
        <LoadingModal isVisible={state.isVisible}>
          {state.modal === LoadingScreenModal.Signature && (
            <SignatureLoading {...state.modalProps} />
          )}
          {state.modal === LoadingScreenModal.Transaction && (
            <TransactionLoadingModal {...state.modalProps} />
          )}
        </LoadingModal>

        {children}
      </LoadingScreenControllerContext.Provider>
    </>
  );
};
