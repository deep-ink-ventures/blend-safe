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



def test_send_arbitrary_evm_tx():
    wallet_id = 'test'
    safe = create_safe()
    wallet = safe.get_wallet(wallet_id)[0][0]

    print(wallet)

    eth_address = Web3.to_checksum_address(safe.eth_address(wallet_id)[0]['Ok'])

    w3 = Web3(Web3.HTTPProvider('https://goerli.infura.io/v3/1aa49601abc34fce881a9934647b806a'))

    pong_private_key = keys.PrivateKey(
        bytes.fromhex(
            os.environ.get('PONG_PRIVATE_KEY', 'dd92e91d848d4b48ac636ea9136aae8bc88b86ad7ced5c3ba305e4c615eeb744')
        )
    )
    pong_address = keys.private_key_to_public_key(pong_private_key).to_checksum_address()

    amount_in_ether = 0.000001
    gas = 21000
    amount_in_wei = Web3.to_wei(amount_in_ether, 'ether')
    chain_id = 5 # goerli

    # nonce = w3.eth.get_transaction_count(pong_address)
    # transaction = {
    #     'from': pong_address,
    #     'to': eth_address,
    #     'value': amount_in_wei,
    #     'gas': gas,
    #     'gasPrice': w3.eth.gas_price,
    #     'nonce': nonce,
    #     'chainId': chain_id  # goerli
    # }
    #
    # signed_txn = w3.eth.account.sign_transaction(transaction, pong_private_key)
    # w3.eth.send_raw_transaction(signed_txn.rawTransaction)

    # Now the fun part: Send it back!

    nonce = w3.eth.get_transaction_count(eth_address)

    # Create a new transaction with the signature
    unsigned_transaction = serializable_unsigned_transaction_from_dict({
        'to': pong_address,
        'value': amount_in_wei,
        'gas': gas,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
        'chainId': chain_id # goerli
    })
    raw_unsigned_tx = rlp.encode(unsigned_transaction).hex()

    safe.propose(wallet_id, raw_unsigned_tx)
    safe.approve(wallet_id, raw_unsigned_tx)
    signature_enc = safe.sign(wallet_id, raw_unsigned_tx)[0]['Ok']
    signature = bytes.fromhex(signature_enc)

    r = int.from_bytes(signature[:32], 'big')
    s = int.from_bytes(signature[32:64], 'big')
    v = (chain_id * 2) + 35 + signature[64]

    signed_transaction = encode_transaction(unsigned_transaction, (v, r, s))
    tx_hash = w3.eth.send_raw_transaction(signed_transaction)
    print(tx_hash)

    print(pong_address, eth_address)

