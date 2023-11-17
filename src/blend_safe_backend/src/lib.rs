mod wallet;
mod signer;

use std::cell::RefCell;
use std::collections::BTreeMap;
use candid::CandidType;
use crate::wallet::{MultiSignatureWallet, Wallet};


type WalletStore = BTreeMap<String, Wallet>;

thread_local! {
    static WALLETS: RefCell<WalletStore> = RefCell::default();
}

const WALLET_ALREADY_EXISTS_ERROR: &str = "WalletAlreadyExists";


#[ic_cdk::update]
fn create_wallet(wallet_id: String) -> Result<(), String> {
    if WALLETS.with(|wallets| wallets.borrow().contains_key(&wallet_id)) {
        return Err(WALLET_ALREADY_EXISTS_ERROR.to_string());
    }

    let mut wallet = Wallet::default();
    wallet.add_signer(ic_cdk::caller());
    WALLETS.with(|wallets| {
        wallets.borrow_mut().insert(wallet_id, wallet);
    });
    Ok(())
}
