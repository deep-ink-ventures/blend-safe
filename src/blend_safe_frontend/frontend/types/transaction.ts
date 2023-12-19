import type { CamelCaseObject } from '../utils/transformer';
import type { Signatory, Signature } from './acount';

export enum TransactionStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Executed = 'EXECUTED',
  Executable = 'EXECUTABLE',
}

export interface RawTransaction {
  id: number;
  xdr: string;
  preimage_hash: string;
  call_func: string;
  call_args: Record<string, any> | string[];
  approvals?: Signature[];
  rejections?: Signature[];
  status: TransactionStatus;
  executed_at: string;
  created_at: string;
  updated_at: string;
  address: string;
  default_threshold: number;
  signatories: Signatory[];
  submitter?: {
    address: string;
    name?: string;
  };
}

export type Transaction = CamelCaseObject<RawTransaction>;
