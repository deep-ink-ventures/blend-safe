import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Message { 'signers' : Array<Principal>, 'message' : string }
export interface Wallet {
  'threshold' : number,
  'signers' : Array<Principal>,
  'message_queue' : Array<[Uint8Array | number[], Array<Principal>]>,
}
export interface _SERVICE {
  'approve' : ActorMethod<
    [string, string],
    { 'Ok' : number } |
      { 'Err' : string }
  >,
  'can_sign' : ActorMethod<[string, string], boolean>,
  'create_wallet' : ActorMethod<
    [string, Array<Principal>, number],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'eth_address' : ActorMethod<[string], { 'Ok' : string } | { 'Err' : string }>,
  'get_messages_to_sign' : ActorMethod<
    [string],
    { 'Ok' : Array<string> } |
      { 'Err' : string }
  >,
  'get_messages_with_signers' : ActorMethod<
    [string],
    { 'Ok' : Array<[string, Array<Principal>]> } |
      { 'Err' : string }
  >,
  'get_proposed_messages' : ActorMethod<
    [string],
    { 'Ok' : Array<string> } |
      { 'Err' : string }
  >,
  'get_wallet' : ActorMethod<[string], [] | [Wallet]>,
  'propose' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'sign' : ActorMethod<
    [string, string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'verify_signature' : ActorMethod<
    [string, string, string],
    { 'Ok' : boolean } |
      { 'Err' : string }
  >,
}
