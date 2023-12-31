use std::collections::{HashMap, HashSet};
use candid::{CandidType, Principal};
use serde::Deserialize;

#[derive(Debug, PartialEq)]
pub enum WalletError {
    /// Represents an error when the signature provided is invalid.
    InvalidSignature,
    /// Error when a message is already queued for signing.
    MsgAlreadyQueued,
    /// Error when a message is not found in the queue.
    MsgNotQueued,
    /// Error when there are not enough signers to meet the threshold.
    NotEnoughSigners,
}


/// A trait defining the behaviors of a MultiSignature Wallet.
pub trait MultiSignatureWallet {
    /// Add a new signer to the wallet.
    ///
    /// * `signer` - The `Principal` of the signer to add.
    fn add_signer(&mut self, signer: Principal);

    /// Remove an existing signer from the wallet.
    ///
    /// * `signer` - The `Principal` of the signer to remove.
    fn remove_signer(&mut self, signer: Principal);

    /// Get a list of all current signers of the wallet.
    ///
    /// Returns a `Vec<Principal>` containing the principals of all signers.
    fn get_signers(&self) -> Vec<Principal>;

    /// Set the default threshold for signing.
    ///
    /// * `threshold` - The threshold as a `u8` value.
    ///
    /// Returns `Result<(), WalletError>` indicating success or the type of failure.
    fn set_default_threshold(&mut self, threshold: u8) -> Result<(), WalletError>;

    /// Check if a given `Principal` is a signer in the wallet.
    ///
    /// * `signer` - The `Principal` to check.
    ///
    /// Returns `bool` indicating whether the signer is present.
    fn has_signer(&self, signer: Principal) -> bool;

    /// Get the current default threshold for signing.
    ///
    /// Returns the threshold as a `u8` value.
    fn get_default_threshold(&self) -> u8;

    /// Propose a new message for signing.
    ///
    /// * `caller` - The `Principal` proposing the message.
    /// * `msg` - The message as a `Vec<u8>`.
    ///
    /// Returns `Result<(), WalletError>` indicating success or the type of failure.
    fn propose_message(&mut self, caller: Principal, msg: Vec<u8>) -> Result<(), WalletError>;

    /// Check if a message can be signed according to the current rules.
    ///
    /// * `msg` - A reference to the message as a `Vec<u8>`.
    ///
    /// Returns `bool` indicating whether the message can be signed.
    fn can_sign(&self, msg: &Vec<u8>) -> bool;

    /// Approve a message with a signer's consent.
    ///
    /// * `msg` - The message as a `Vec<u8>`.
    /// * `signer` - The `Principal` of the signer approving the message.
    ///
    /// Returns `Result<u8, WalletError>` indicating the number of approvals or the type of failure.
    fn approve(&mut self, msg: Vec<u8>, signer: Principal) -> Result<u8, WalletError>;
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Wallet {
     /// A set of signers for the wallet, represented by their `Principal`.
    signers: HashSet<Principal>,
    /// The threshold number of signers required for certain actions.
    threshold: u8,
    /// A map tracking messages and the list of signers who have already signed them.
    message_queue: HashMap<Vec<u8>, Vec<Principal>>,
}

impl Default for Wallet {
    fn default() -> Self {
        Wallet {
            signers: HashSet::new(),
            threshold: 0,
            message_queue: HashMap::new(),
        }
    }
}

impl MultiSignatureWallet for Wallet {
    fn add_signer(&mut self, signer: Principal) {
        self.signers.insert(signer);
    }

    fn remove_signer(&mut self, signer: Principal) {
        self.signers.remove(&signer);
    }

    fn get_signers(&self) -> Vec<Principal> {
        self.signers.iter().cloned().collect()
    }

    fn set_default_threshold(&mut self, threshold: u8) -> Result<(), WalletError> {
        if self.signers.len() < threshold as usize {
            return Err(WalletError::NotEnoughSigners);
        }
        self.threshold = threshold;
        Ok(())
    }

    fn has_signer(&self, signer: Principal) -> bool {
        self.signers.contains(&signer)
    }

    fn get_default_threshold(&self) -> u8 {
        self.threshold
    }

    fn propose_message(&mut self, caller: Principal, msg: Vec<u8>) -> Result<(), WalletError> {
        if !self.signers.contains(&caller) {
            return Err(WalletError::InvalidSignature);
        }

        if self.message_queue.contains_key(&msg) {
            return Err(WalletError::MsgAlreadyQueued);
        }

        self.message_queue.insert(msg.clone(), Vec::new());

        Ok(())
    }

    fn can_sign(&self, msg: &Vec<u8>) -> bool {
        if !self.message_queue.contains_key(msg) {
            return false;
        }
        self.message_queue[msg].len() >= self.threshold as usize
    }

    fn approve(&mut self, msg: Vec<u8>, signer: Principal) -> Result<u8, WalletError> {
        if !self.message_queue.contains_key(&msg) {
            return Err(WalletError::MsgNotQueued);
        }

        if !self.signers.contains(&signer) {
            return Err(WalletError::InvalidSignature);
        }

        let queue = self.message_queue.get_mut(&msg).unwrap();
        queue.push(signer);

        Ok(queue.len() as u8)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal;
    use std::str::FromStr;

    #[test]
    fn test_default_wallet() {
        let wallet = Wallet::default();
        assert_eq!(wallet.get_signers().len(), 0);
        assert_eq!(wallet.get_default_threshold(), 0);
    }

    #[test]
    fn test_add_remove_signer() {
        let mut wallet = Wallet::default();

        let signer1 = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        let signer2 = Principal::from_str("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();

        wallet.add_signer(signer1.clone());
        wallet.add_signer(signer2.clone());

        let signers = wallet.get_signers();
        assert_eq!(signers.len(), 2);
        assert!(signers.contains(&signer1));
        assert!(signers.contains(&signer2));

        wallet.remove_signer(signer1.clone());
        let signers = wallet.get_signers();
        assert_eq!(signers.len(), 1);
        assert!(!signers.contains(&signer1));
        assert!(signers.contains(&signer2));
    }

    #[test]
    fn test_set_get_default_threshold() {
        let mut wallet = Wallet::default();

        assert_eq!(wallet.get_default_threshold(), 0);

        wallet.add_signer(Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap());
        let _ = wallet.set_default_threshold(1);
        assert_eq!(wallet.get_default_threshold(), 1);
        assert_eq!(wallet.set_default_threshold(2), Err(WalletError::NotEnoughSigners));
    }

    #[test]
    fn test_propose_message_valid_signature() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];
        let result = wallet.propose_message(signer, msg);

        assert!(result.is_ok());
    }

    #[test]
    fn test_propose_message_invalid_signature() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        // Don't add the signer to the wallet.
        // wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];
        let result = wallet.propose_message(signer, msg.clone());

        assert_eq!(result.err(), Some(WalletError::InvalidSignature));
    }

    #[test]
    fn test_propose_message_duplicate_message() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];
        let _ = wallet.propose_message(signer.clone(), msg.clone());

        // Try proposing the same message again.
        let result = wallet.propose_message(signer, msg);

        assert_eq!(result.err(), Some(WalletError::MsgAlreadyQueued));
    }

    #[test]
    fn test_can_sign_threshold_not_met() {
        let mut wallet = Wallet::default();

        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());
        let _ = wallet.set_default_threshold(1);


        let msg = vec![1, 2, 3];
        let _ = wallet.propose_message(signer.clone(), msg.clone());

        // Threshold is not met, so cannot sign.
        let can_sign = wallet.can_sign(&msg.clone());

        assert_eq!(can_sign, false);
    }

    #[test]
    fn test_can_sign_message_not_queued() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];

        // Message is not in the queue, so cannot sign.
        let can_sign = wallet.can_sign(&msg.clone());

        assert_eq!(can_sign, false);
    }

     #[test]
    fn test_approve_valid_message() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());
        let _ = wallet.set_default_threshold(1);

        let msg = vec![1, 2, 3];
        wallet.propose_message(signer.clone(), msg.clone()).unwrap();

        assert_eq!(wallet.can_sign(&msg), false);
        let result = wallet.approve(msg.clone(), signer);

        assert!(result.is_ok());
        assert_eq!(wallet.can_sign(&msg), true);
    }

    #[test]
    fn test_approve_invalid_message() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];

        let result = wallet.approve(msg.clone(), signer);

        assert_eq!(result.err(), Some(WalletError::MsgNotQueued));
    }

    #[test]
    fn test_approve_not_signer() {
        let mut wallet = Wallet::default();
        let signer1 = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        let signer2 = Principal::from_str("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
        let _ = wallet.set_default_threshold(1);
        wallet.add_signer(signer1.clone());

        let msg = vec![1, 2, 3];
        wallet.propose_message(signer1.clone(), msg.clone()).unwrap();

        let result = wallet.approve(msg.clone(), signer2);

        assert_eq!(result.err(), Some(WalletError::InvalidSignature));
    }

    #[test]
    fn test_has_signer() {
        let mut wallet = Wallet::default();
        let signer1 = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        let signer2 = Principal::from_str("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
        wallet.add_signer(signer1.clone());

        assert_eq!(wallet.has_signer(signer1.clone()), true);
        assert_eq!(wallet.has_signer(signer2.clone()), false);
    }
}
