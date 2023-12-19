import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface _SERVICE {
  getValue: ActorMethod<[], bigint>;
  increment: ActorMethod<[], undefined>;
}
