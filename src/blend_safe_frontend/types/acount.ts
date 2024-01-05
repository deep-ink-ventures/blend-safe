import type BigNumber from 'bignumber.js';

export type Signatory = {
  name: string;
  address: string;
};

export interface Signature {
  signature: string;
  signatory: Signatory;
}

export type Contract = {
  address: string;
  limit: BigNumber;
  alreadySpent: BigNumber;
  type: string;
};

export type RawContract = {
  address: string;
  limit: BigNumber;
  already_spent: BigNumber;
  type: string;
};

export type RawPolicy = {
  address: string;
  name: string;
  contracts: RawContract[] | null;
};

export type Policy = {
  address: string;
  name: string;
  contracts: Contract[] | null;
};

export interface RawAccount {
  name: string;
  address: string;
  signatories: Signatory[];
  default_threshold: number;
  policy: RawPolicy;
}

export interface Account {
  name: string;
  address: string;
  signatories: Signatory[];
  defaultThreshold: number;
  policy: Policy;
}
