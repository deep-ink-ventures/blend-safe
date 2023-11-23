from uuid import uuid4

from ic import Principal
from ic.canister import encode, Types

from config import create_safe, assert_ok, assert_err, get_default_identities


def test_wallet_lifecycle():
    wallet_id = f'test_{str(uuid4())[0:8]}'

    safe = create_safe()
    principals = [_.sender().to_str() for _ in get_default_identities()]

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
