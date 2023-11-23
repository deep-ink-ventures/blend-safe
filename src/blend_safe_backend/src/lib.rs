mod wallet;
mod signer;

use std::cell::RefCell;
use std::collections::BTreeMap;
use candid::{CandidType, Principal};
use crate::wallet::{MultiSignatureWallet, Wallet};


type WalletStore = BTreeMap<String, Wallet>;

thread_local! {
    static WALLETS: RefCell<WalletStore> = RefCell::default();
}

const WALLET_ALREADY_EXISTS_ERROR: &str = "WalletAlreadyExists";
const WALLET_SIGNERS_NOT_MATCH_THRESHOLD: &str = "WalletSignersNotMatchThreshold";
const WALLET_DOES_NOT_EXIST_ERROR: &str = "WalletDoesNotExist";

#[ic_cdk::update]
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

#[ic_cdk::query]
fn get_wallet(wallet_id: String) -> Option<Wallet> {
    WALLETS.with(|wallets| {
        wallets.borrow().get(&wallet_id).cloned()
    })
}


#[ic_cdk::update]
fn add_signer(wallet_id: String, signer: Principal) -> Result<(), String> {
    WALLETS.with(|wallets| {
        wallets
            .borrow_mut()
            .get_mut(&wallet_id)
            .ok_or(WALLET_DOES_NOT_EXIST_ERROR.to_string())
            .and_then(|wallet| {
                wallet.add_signer(signer);
                Ok(())
            })
    })
}

#[ic_cdk::update]
fn change_threshold(wallet_id: String, threshold: u8) -> Result<(), String> {
    WALLETS.with(|wallets| {
        wallets
            .borrow_mut()
            .get_mut(&wallet_id)
            .ok_or(WALLET_DOES_NOT_EXIST_ERROR.to_string())
            .and_then(|wallet| {
                wallet
                    .set_default_threshold(threshold)
                    .map_err(|_| "Error setting threshold".to_string())
            })
    })
}
