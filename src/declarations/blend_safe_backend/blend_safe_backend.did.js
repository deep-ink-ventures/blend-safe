export const idlFactory = ({ IDL }) => {
  const Wallet = IDL.Record({
    'threshold' : IDL.Nat8,
    'signers' : IDL.Vec(IDL.Principal),
    'message_queue' : IDL.Vec(
      IDL.Tuple(IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Principal))
    ),
  });
  return IDL.Service({
    'approve' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Nat8, 'Err' : IDL.Text })],
        [],
      ),
    'can_sign' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'create_wallet' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Principal), IDL.Nat8],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'eth_address' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'get_messages_to_sign' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Vec(IDL.Text), 'Err' : IDL.Text })],
        [],
      ),
    'get_messages_with_signers' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Principal))),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'get_proposed_messages' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Vec(IDL.Text), 'Err' : IDL.Text })],
        [],
      ),
    'get_wallet' : IDL.Func([IDL.Text], [IDL.Opt(Wallet)], []),
    'propose' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'sign' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'verify_signature' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return [IDL.Text]; };
