from ic.canister import Canister
from ic.client import Client
from ic.identity import Identity
from ic.agent import Agent


def assert_ok(res):
    assert 'Ok' in res[0], 'Result not ok'


def assert_err(res, error=""):
    assert 'Err' in res[0], 'Result not err'
    if error:
        assert res[0]['Err'] == error, 'Error not match'


def get_id(container):
    return "bkyz2-fmaaa-aaaaa-qaaaq-cai"


def get_agent():
    return Agent(Identity(), Client(url="http://127.0.0.1:4943"))


def create_safe():
    canister_id = get_id("blend_safe_backend")

    return Canister(
        agent=get_agent(),
        canister_id=get_id("blend_safe_backend"),
        candid=open("../src/blend_safe_backend/blend_safe_backend.did").read()
    )
