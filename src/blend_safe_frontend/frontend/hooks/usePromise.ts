import { useReducer } from 'react';

export interface UsePromiseParams<T extends any[], P> {
  promiseFunction: (...args: T) => Promise<P>;
}

export enum PromiseStatus {
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  INITIAL = 'INITIAL',
}

export interface PromiseAction<P> {
  type: PromiseStatus;
  payload?: P | null;
}

export interface PromiseState<P> {
  value?: P | null;
  pending: boolean;
  fulfilled: boolean;
  rejected: boolean;
  reason: any;
}

const promiseReducer = <P>(
  state: PromiseState<P>,
  action: PromiseAction<P>
) => {
  const { type, payload } = action;
  switch (type) {
    case PromiseStatus.PENDING:
      return {
        ...state,
        rejected: false,
        pending: true,
        fulfilled: false,
      };
    case PromiseStatus.FULFILLED:
      return {
        ...state,
        rejected: false,
        pending: false,
        fulfilled: true,
        value: payload,
      };
    case PromiseStatus.REJECTED:
      return {
        ...state,
        pending: false,
        fulfilled: false,
        rejected: true,
        reason: payload,
      };
    default:
      return state;
  }
};

export const usePromise = <T extends any[], P = any>({
  promiseFunction,
}: UsePromiseParams<T, P>) => {
  const [promiseState, dispatch] = useReducer(promiseReducer<P>, {
    pending: false,
    rejected: false,
    fulfilled: false,
    reason: null,
    value: null,
  });

  const call = async (...params: T) => {
    dispatch({
      type: PromiseStatus.PENDING,
    });
    promiseFunction(...params).then(
      (result) => {
        dispatch({
          type: PromiseStatus.FULFILLED,
          payload: result,
        });
        return result;
      },
      (error) => {
        dispatch({
          type: PromiseStatus.REJECTED,
          payload: error,
        });
        throw error;
      }
    );
  };

  return {
    ...promiseState,
    call,
  };
};
