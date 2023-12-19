import os
from uuid import uuid4

from coincurve import PublicKey

from config import create_safe, get_default_identities, get_wallet_id, assert_ok, assert_err, get_default_principals
from web3 import Web3


def test_wallet_lifecycle():
    wallet_id = get_wallet_id()

    safe = create_safe()
    principals = get_default_principals()

    # create wallet
    assert_ok(safe.create_wallet(wallet_id, principals, 1))

    # get wallet
    wallet = safe.get_wallet(wallet_id)[0][0]

    for p in wallet['signers']:
        assert p.to_str() in principals
    assert len(wallet['message_queue']) == 0
    assert wallet['threshold'] == 1


def test_wallet_not_created_twice():
    wallet_id = f'test_{str(uuid4())[0:8]}'

    safe = create_safe()
    principals = [_.sender().to_str() for _ in get_default_identities()]

    # create wallet
    assert_ok(safe.create_wallet(wallet_id, principals, 1))
    assert_err(safe.create_wallet(wallet_id, principals, 1), 'WalletAlreadyExists')


def test_signing_lifecycle():
    wallet_id = get_wallet_id()
    safe = create_safe()
    assert_ok(safe.create_wallet(wallet_id, get_default_principals(), 1))

    eth_address = safe.eth_address(wallet_id)[0]['Ok']

    challenge = os.urandom(32)
    challenge_enc = challenge.hex()
    safe.propose(wallet_id, challenge_enc)
    safe.approve(wallet_id, challenge_enc)

    signature_enc = safe.sign(wallet_id, challenge_enc)[0]['Ok']
    signature = bytes.fromhex(signature_enc)

    # recover in python
    public_key = PublicKey.from_signature_and_message(signature, challenge, hasher=None)
    uncompressed_pubkey = public_key.format(compressed=False)
    keccak_hash = Web3.keccak(uncompressed_pubkey[1:])

    rec_address = keccak_hash[-20:].hex()
    assert rec_address == eth_address

    # check in canister
    valid = safe.verify_signature(wallet_id, challenge_enc, signature_enc)
    assert valid[0]['Ok']
