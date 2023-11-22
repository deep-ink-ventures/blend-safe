from uuid import uuid4

from config import create_safe, assert_ok, assert_err


def test_wallet_lifecycle():
    wallet_id = f'test_{str(uuid4())[0:8]}'

    safe = create_safe()
    assert_ok(safe.create_wallet(wallet_id))
    assert_err(safe.create_wallet(wallet_id), 'WalletAlreadyExists')
