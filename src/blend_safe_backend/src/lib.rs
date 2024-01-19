mod wallet;
mod ecdsa;

use std::cell::RefCell;
use std::collections::BTreeMap;
use candid::Principal;
use ic_cdk::{caller, init, query, update};
use ic_cdk::api::management_canister::ecdsa::EcdsaKeyId;
use crate::wallet::{MultiSignatureWallet, Wallet, WalletError};

use crate::ecdsa::{get_eth_address, sign_message, get_ecdsa_key_id_from_env, is_signature_valid};

type WalletStore = BTreeMap<String, Wallet>;

thread_local! {
    static WALLETS: RefCell<WalletStore> = RefCell::default();
    static KEY_ID: RefCell<EcdsaKeyId> = RefCell::default();
}

const WALLET_NOT_FOUND_ERROR: &str = "WalletNotFound";
const WALLET_ALREADY_EXISTS_ERROR: &str = "WalletAlreadyExists";
const WALLET_MSG_ALREADY_QUEUED_ERROR: &str = "WalletMsgAlreadyQueued";
const WALLET_INVALID_SIGNATURE_ERROR: &str = "WalletInvalidSignature";
const WALLET_CANNOT_SIGN_ERROR: &str = "WalletCannotSign";
const WALLET_SIGNERS_NOT_MATCH_THRESHOLD: &str = "WalletSignersNotMatchThreshold";


/// Initializes the module with environment-specific configurations.
///
/// # Arguments
///
/// * `env` - A string representing the environment.
///
/// # Behavior
///
/// Initializes the KEY_ID with an EcdsaKeyId based on the provided environment.
#[init]
fn init(env: String) {
    KEY_ID.with(|key_id| {
        key_id.borrow_mut().clone_from(&get_ecdsa_key_id_from_env(&env));
    });
}

/// Creates a new wallet.
///
/// # Arguments
///
/// * `wallet_id` - Unique identifier for the wallet as a String.
/// * `signers` - A list of Principals representing the signers of the wallet.
/// * `threshold` - The threshold number of signers required for a transaction.
///
/// # Returns
///
/// * `Result<(), String>` - Result indicating success or an error message.
#[update]
fn create_wallet(wallet_id: String, signers: Vec<Principal>, threshold: u8) -> Result<(), String> {
    if WALLETS.with(|wallets| wallets.borrow().contains_key(&wallet_id)) {
        return Err(WALLET_ALREADY_EXISTS_ERROR.to_string());
    }

    let mut wallet = Wallet::default();

    signers.iter().for_each(|signer| {
        wallet.add_signer(signer.clone());
    });
    if wallet.set_default_threshold(threshold).is_err() {
        return Err(WALLET_SIGNERS_NOT_MATCH_THRESHOLD.to_string())
    }

    WALLETS.with(|wallets| {
        wallets.borrow_mut().insert(wallet_id, wallet);
    });
    Ok(())
}

/// Retrieves a wallet by its ID.
///
/// # Arguments
///
/// * `wallet_id` - The unique identifier for the wallet as a String.
///
/// # Returns
///
/// * `Option<Wallet>` - The wallet if found, otherwise None.
#[query]
fn get_wallet(wallet_id: String) -> Option<Wallet> {
    WALLETS.with(|wallets| {
        wallets.borrow().get(&wallet_id).cloned()
    })
}


/// Proposes a message to be signed by the wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
/// * `msg` - The message to be proposed, in hexadecimal format.
///
/// # Returns
///
/// * `Result<(), String>` - Result indicating success or an error message.
#[update]
fn propose(wallet_id: String, msg: String) -> Result<(), String> {
    let msg = hex::decode(msg).map_err(|_| "InvalidMessage".to_string())?;
    WALLETS.with(|wallets| {
        wallets.borrow_mut().get_mut(&wallet_id).ok_or(WALLET_NOT_FOUND_ERROR.to_string()).unwrap()
            .propose_message(caller(), msg).map_err(|error| {
                match error {
                    WalletError::MsgAlreadyQueued => WALLET_MSG_ALREADY_QUEUED_ERROR.to_string(),
                    WalletError::InvalidSignature => WALLET_INVALID_SIGNATURE_ERROR.to_string(),
                    _ => "UnknownError".to_string(),
                }
            })
    })
}

/// Checks if a message can be signed by the wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
/// * `msg` - The message to be checked, in hexadecimal format.
///
/// # Returns
///
/// * `bool` - True if the message can be signed, otherwise false.
#[query]
fn can_sign(wallet_id: String, msg: String) -> bool {
    match hex::decode(&msg) {
        Ok(decoded_msg) => {
            WALLETS.with(|wallets| {
                wallets.borrow().get(&wallet_id).ok_or(WALLET_NOT_FOUND_ERROR.to_string()).unwrap()
                    .can_sign(&decoded_msg)
            })
        }
        Err(_) => false,
    }
}

/// Approves a message for signing in the wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
/// * `msg` - The message to be approved, in hexadecimal format.
///
/// # Returns
///
/// * `Result<u8, String>` - The number of signatures or an error message.
#[update]
fn approve(wallet_id: String, msg: String) -> Result<u8, String> {
    let msg = hex::decode(msg).map_err(|_| "InvalidMessage".to_string())?;
    WALLETS.with(|wallets| {
         wallets.borrow_mut().get_mut(&wallet_id).ok_or(WALLET_NOT_FOUND_ERROR.to_string()).unwrap()
            .approve(msg, caller()).map_err(|error| {
                match error {
                    WalletError::MsgNotQueued => "WalletMsgNotQueued".to_string(),
                    WalletError::InvalidSignature => WALLET_INVALID_SIGNATURE_ERROR.to_string(),
                    _ => "UnknownError".to_string(),
                }
            })
    })
}

/// Signs a message using the wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
/// * `msg` - The message to be signed, in hexadecimal format.
///
/// # Returns
///
/// * `Result<String, String>` - The signature in hexadecimal format or an error message.
#[update]
async fn sign(wallet_id: String, msg: String) -> Result<String, String> {
    let msg = hex::decode(msg).map_err(|_| "InvalidMessage".to_string())?;

    let can_sign = WALLETS.with(|wallets| {
        wallets.borrow().get(&wallet_id).ok_or(WALLET_NOT_FOUND_ERROR.to_string()).unwrap()
            .can_sign(&msg)
    });

    let key_id = KEY_ID.with(|key_id| {
        key_id.borrow().clone()
    });

    if !can_sign {
        return Err(WALLET_CANNOT_SIGN_ERROR.to_string());
    }

    let signature = sign_message(wallet_id, msg, key_id).await?;
    Ok(hex::encode(signature))
}

/// Retrieves the Ethereum address associated with the wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
///
/// # Returns
///
/// * `Result<String, String>` - The Ethereum address or an error message.
#[update]
async fn eth_address(wallet_id: String) -> Result<String, String> {
    let key_id = KEY_ID.with(|key_id| {
        key_id.borrow().clone()
    });
    get_eth_address(wallet_id, key_id).await
}

/// Verifies a signature for a given message and wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
/// * `message` - The message associated with the signature, in hexadecimal format.
/// * `signature` - The signature to be verified, in hexadecimal format.
///
/// # Returns
///
/// * `Result<bool, String>` - True if the signature is valid, otherwise an error message.
#[update]
async fn verify_signature(wallet_id: String, message: String, signature: String) -> Result<bool, String> {

    let message = hex::decode(message).map_err(|_| "Invalid message".to_string())?;
    let signature = hex::decode(signature).map_err(|_| "Invalid signature".to_string())?;
    let key_id = KEY_ID.with(|key_id| {
        key_id.borrow().clone()
    });
    Ok(is_signature_valid(message, signature, wallet_id, key_id).await?)
}

/// Retrieves all messages that can be signed for a given wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
///
/// # Returns
///
/// * `Vec<Vec<u8>>` - A list of messages that can be signed.
#[query]
fn get_messages_to_sign(wallet_id: String) -> Result<Vec<String>, String> {
    WALLETS.with(|wallets| {
        wallets.borrow().get(&wallet_id)
            .ok_or(WALLET_NOT_FOUND_ERROR.to_string())
            .map(|wallet| {
                wallet.get_messages_to_sign()
                      .into_iter()
                      .map(|msg| hex::encode(msg))
                      .collect()
            })
    })
}

/// Retrieves all messages that have been proposed for a given wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
///
/// # Returns
///
/// * `Vec<Vec<u8>>` - A list of messages that have been proposed.
#[query]
fn get_proposed_messages(wallet_id: String) -> Result<Vec<String>, String> {
    WALLETS.with(|wallets| {
        wallets.borrow().get(&wallet_id)
            .ok_or(WALLET_NOT_FOUND_ERROR.to_string())
            .map(|wallet| {
                wallet.get_proposed_messages()
                      .into_iter()
                      .map(|msg| hex::encode(msg))
                      .collect()
            })
    })
}

/// Retrieves all messages that have been proposed along with their signers for a given wallet.
///
/// # Arguments
///
/// * `wallet_id` - The wallet's unique identifier.
///
/// # Returns
///
/// * `Vec<(Vec<u8>, Vec<Principal>)>` - A list of tuples containing messages and their signers.
#[query]
fn get_messages_with_signers(wallet_id: String) -> Result<Vec<(String, Vec<Principal>)>, String> {
    WALLETS.with(|wallets| {
        wallets.borrow().get(&wallet_id)
            .ok_or(WALLET_NOT_FOUND_ERROR.to_string())
            .map(|wallet| {
                wallet.get_messages_with_signers()
                      .into_iter()
                      .map(|(msg, signers)| (hex::encode(msg), signers))
                      .collect()
            })
    })
}