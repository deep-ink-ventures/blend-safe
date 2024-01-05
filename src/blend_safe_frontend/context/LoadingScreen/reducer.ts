import type { ISignatureLoadingProps } from '../../components/SignatureLoadingModal';
import type { ITransactionLoadingModalProps } from '../../components/TransactionLoadingModal';

const SHOW_TRANSACTION_PROCESSING = 'SHOW_TRANSACTION_PROCESSING';
const SHOW_SIGNATURE = 'SHOW_SIGNATURE';
const CLOSE = 'CLOSE';

export type IActionTypes =
  | typeof SHOW_SIGNATURE
  | typeof CLOSE
  | typeof SHOW_TRANSACTION_PROCESSING;

export type IModalProps = any;

export type IAction =
  | {
      type: typeof SHOW_SIGNATURE;
      payload?: ISignatureLoadingProps;
    }
  | {
      type: typeof SHOW_TRANSACTION_PROCESSING;
      payload?: ITransactionLoadingModalProps;
    }
  | {
      type: typeof CLOSE;
      payload?: null;
    };

export interface ILoadingScreenState {
  isVisible: boolean;
  modal: LoadingScreenModal | null;
  modalProps?: IModalProps | null;
}

export enum LoadingScreenModal {
  Signature = 'Signature',
  Transaction = 'Trasaction',
}
const reducer = (
  state: ILoadingScreenState,
  action: IAction
): ILoadingScreenState => {
  switch (action.type) {
    case SHOW_SIGNATURE:
      return {
        ...state,
        isVisible: true,
        modal: LoadingScreenModal.Signature,
        modalProps: action.payload,
      };
    case SHOW_TRANSACTION_PROCESSING:
      return {
        isVisible: true,
        modal: LoadingScreenModal.Transaction,
      };
    case CLOSE:
      return {
        ...state,
        isVisible: false,
        modal: null,
        modalProps: null,
      };
    default:
      return state;
  }
};

export default reducer;
