import os

from coincurve import PublicKey

from config import create_safe, get_default_identity, get_some_identities
from web3 import Web3
from eth_account.messages import encode_defunct


def test_wallet_initiation():
    safe = create_safe()

    wallet = safe.get_wallet()[0]

    assert len(wallet['signers']) == 1
    assert wallet['threshold'] == 1
    assert len(wallet['message_queue']) == 0
    assert wallet['signers'][0].to_str() == get_default_identity().sender().to_str()


def test_signing_lifecycle():
    safe = create_safe()
    eth_address = safe.eth_address()[0]['Ok']
    challenge = os.urandom(32)
    challenge_enc = challenge.hex()
    safe.propose(challenge_enc)
    safe.approve(challenge_enc)
    signature_enc = safe.sign(challenge_enc)[0]['Ok']
    signature = bytes.fromhex(signature_enc)

    public_key = PublicKey.from_signature_and_message(signature, challenge, hasher=None)
    uncompressed_pubkey = public_key.format(compressed=False)
    keccak_hash = Web3.keccak(uncompressed_pubkey[1:])

    reccovered_address = keccak_hash[-20:].hex()

    print("Eth address: ", eth_address)
    print("Eth address2: ", reccovered_address)
    print(eth_address == reccovered_address)

    valid = safe.verify_signature(challenge_enc, signature_enc)
    print(valid)
