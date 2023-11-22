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
