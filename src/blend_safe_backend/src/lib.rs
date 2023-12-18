extern crate core;

mod wallet;
mod crypto;

use crypto::find_recovery_id;
use ic_web3::ic::{get_eth_addr, KeyInfo, ic_raw_sign, verify, get_public_key};
use std::cell::RefCell;
use candid::{CandidType, Deserialize};
use ic_cdk::{caller, init, query, update};
use crate::wallet::{MultiSignatureWallet, Wallet, WalletError};

use ic_cdk::api::management_canister::main::CanisterId;
use serde::Serialize;
use libsecp256k1::{PublicKey, PublicKeyFormat, Message, Signature, RecoveryId, recover};


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

#[update]
async fn sign(msg: String) -> Result<String, String> {
    let msg = hex::decode(msg).map_err(|_| "InvalidMessage".to_string())?;

    let can_sign = WALLET.with(|wallet| {
        wallet
            .borrow()
            .can_sign(&msg)
    });

    let key_id = KEY_ID.with(|key_id| {
        key_id.borrow().clone()
    });

    if !can_sign {
        return Err(WALLET_CANNOT_SIGN_ERROR.to_string());
    }

    let signature = ic_raw_sign(msg.clone(), key_id.to_key_info()).await.map_err(|_| WALLET_CANNOT_SIGN_ERROR);

    // add rec id
    let mut sig = signature.unwrap();
    let dev_path =  vec![ic_cdk::id().as_slice().to_vec()];
    let pub_key = get_public_key(None, dev_path, key_id.name).await?;
    let uncompressed_pubkey = match PublicKey::parse_slice(&pub_key, Some(PublicKeyFormat::Compressed)) {
        Ok(key) => { key.serialize() },
        Err(_) => { return Err("uncompress public key failed: ".to_string()); },
    };
    let rec_id = find_recovery_id(&msg, &sig, uncompressed_pubkey).unwrap();
    sig.push(rec_id);

    Ok(hex::encode(sig))
}

#[update]
async fn eth_address() -> Result<String, String> {
    let key_id = KEY_ID.with(|key_id| {
        key_id.borrow().clone()
    });
    match get_eth_addr(None, None, key_id.name).await {
        Ok(addr) => { Ok(format!("0x{}", hex::encode(addr))) },
        Err(e) => { Err(e) }
    }
}


#[update]
async fn verify_signature(message: String, signature: String) -> Result<bool, String> {
    let key_id = KEY_ID.with(|key_id| {
        key_id.borrow().clone()
    });

    let dev_path = vec![ic_cdk::id().as_slice().to_vec()];
    let pub_key = get_public_key(None, dev_path, key_id.name).await?;
    let uncompressed_pubkey = match PublicKey::parse_slice(&pub_key, Some(PublicKeyFormat::Compressed)) {
        Ok(key) => { key.serialize() },
        Err(_) => { return Err("uncompress public key failed: ".to_string()); },
    };

    let message = hex::decode(message).map_err(|_| "Invalid message".to_string())?;
    let signature = hex::decode(signature).map_err(|_| "Invalid signature".to_string())?;

    let recovery_id = signature[64];

    // Signature without recovery ID (first 64 bytes)
    let signature_without_recid = signature[..64].to_vec();

    let message_final = Message::parse_slice(message.as_slice()).expect("Invalid message");
    let recovery_id_final = RecoveryId::parse(recovery_id).expect("Invalid recovery ID");
    let signature_final = Signature::parse_overflowing_slice(signature_without_recid.as_slice()).expect("Invalid signature");
    let recovered_address = recover(&message_final, &signature_final, &recovery_id_final).unwrap();

    Ok(recovered_address.serialize() == uncompressed_pubkey)
}