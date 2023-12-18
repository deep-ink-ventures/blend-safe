import os
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
    challenge = os.urandom(32).hex()
    safe.propose(challenge)
    safe.approve(challenge)
    signature = bytes.fromhex(safe.sign(challenge)[0]['Ok'])

    message_encoded = encode_defunct(text=challenge)
    w3 = Web3()
    for v in [ 0, 1, 27, 28, 35]:
        full_signature = signature + bytes([v])
        signer = w3.eth.account.recover_message(encode_defunct(text=challenge), signature=full_signature)
        print(signer, eth_address)