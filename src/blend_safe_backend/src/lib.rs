mod wallet;
use ic_web3::ic::{get_eth_addr, KeyInfo, ic_raw_sign};
use std::cell::RefCell;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{caller, init, query, update};
use crate::wallet::{MultiSignatureWallet, Wallet, WalletError};

use ic_cdk::api::management_canister::main::CanisterId;
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Debug)]
struct SignWithECDSA {
    pub message_hash: Vec<u8>,
    pub derivation_path: Vec<Vec<u8>>,
    pub key_id: EcdsaKeyId,
}

#[derive(CandidType, Deserialize, Debug)]
struct SignWithECDSAReply {
    pub signature: Vec<u8>,
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
struct EcdsaKeyId {
    pub curve: EcdsaCurve,
    pub name: String,
}

impl Default for EcdsaKeyId {
    fn default() -> Self {
        EcdsaKeyId::from_env("local")
    }
}

impl EcdsaKeyId {
    fn from_env(env: &str) -> Self {
        EcdsaKeyId {
            curve: EcdsaCurve::Secp256k1,
            name: match env {
                "production" => "key_1",
                "test" => "test_key_1",
                _ => "dfx_test_key",
            }.to_string(),
        }
    }

    fn to_key_info(&self) -> KeyInfo {
        KeyInfo {
            derivation_path: vec![ic_cdk::id().as_slice().to_vec()],
            key_name: self.name.clone(),
            ecdsa_sign_cycles: None,
        }

    }
}

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub enum EcdsaCurve {
    #[serde(rename = "secp256k1")]
    Secp256k1,
}

#[derive(CandidType, Serialize, Debug)]
struct ECDSAPublicKey {
    pub canister_id: Option<CanisterId>,
    pub derivation_path: Vec<Vec<u8>>,
    pub key_id: EcdsaKeyId,
}

#[derive(CandidType, Deserialize, Debug)]
struct ECDSAPublicKeyReply {
    pub public_key: Vec<u8>,
    pub chain_code: Vec<u8>,
}

thread_local! {
    static WALLET: RefCell<Wallet> = RefCell::default();
    static KEY_ID: RefCell<EcdsaKeyId> = RefCell::default();
}

const WALLET_MSG_ALREADY_QUEUED_ERROR: &str = "WalletMsgAlreadyQueued";
const WALLET_INVALID_SIGNATURE_ERROR: &str = "WalletInvalidSignature";
const WALLET_CANNOT_SIGN_ERROR: &str = "WalletCannotSign";

#[init]
fn init(env: String) {
    KEY_ID.with(|key_id| {
        key_id.borrow_mut().clone_from(&EcdsaKeyId::from_env(&env));
    });

    let mut fresh_wallet = Wallet::default();
    fresh_wallet.add_signer(caller());
    fresh_wallet.set_default_threshold(1).expect("Failed to set default threshold");

    WALLET.with(|wallet| {
        wallet.borrow_mut().clone_from(&fresh_wallet);
    });
}

#[query]
fn get_wallet() -> Wallet {
    WALLET.with(|wallet| {
        wallet.borrow().clone()
    })
}

#[update]
fn propose(msg: String) -> Result<(), String> {
    let msg = hex::decode(msg).map_err(|_| "InvalidMessage".to_string())?;
    WALLET.with(|wallet| {
        wallet
            .borrow_mut()
            .propose_message(caller(), msg).map_err(|error| {
                match error {
                    WalletError::MsgAlreadyQueued => WALLET_MSG_ALREADY_QUEUED_ERROR.to_string(),
                    WalletError::InvalidSignature => WALLET_INVALID_SIGNATURE_ERROR.to_string(),
                    _ => "UnknownError".to_string(),
                }
            })
    })
}

#[query]
fn can_sign(msg: String) -> bool {
    match hex::decode(&msg) {
        Ok(decoded_msg) => {
            WALLET.with(|wallet| {
                wallet
                    .borrow()
                    .can_sign(&decoded_msg)
            })
        }
        Err(_) => false,
    }
}

#[update]
fn approve(msg: String) -> Result<u8, String> {
    let msg = hex::decode(msg).map_err(|_| "InvalidMessage".to_string())?;
    WALLET.with(|wallet| {
        wallet
            .borrow_mut()
            .approve(msg, caller()).map_err(|error| {
                match error {
                    WalletError::MsgNotQueued => "WalletMsgNotQueued".to_string(),
                    WalletError::InvalidSignature => WALLET_INVALID_SIGNATURE_ERROR.to_string(),
                    _ => "UnknownError".to_string(),
                }
            })
    })
}