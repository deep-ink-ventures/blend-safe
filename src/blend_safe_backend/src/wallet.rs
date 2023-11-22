use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::Deserialize;
use crate::signer::Signer;

#[derive(Debug, PartialEq)]
pub enum WalletError {
    InvalidSignature,
    MsgAlreadyQueued,
    MsgNotQueued,
    CantSign,
    NotEnoughSigners
}

pub trait MultiSignatureWallet {
    fn add_signer(&mut self, signer: Principal);
    fn remove_signer(&mut self, signer: Principal);
    fn get_signers(&self) -> Vec<Principal>;
    fn set_default_threshold(&mut self, threshold: u8) -> Result<(), WalletError>;
    fn get_default_threshold(&self) -> u8;
    fn propose_message(&mut self, caller: Principal, msg: Vec<u8>) -> Result<(), WalletError>;
    fn can_sign(&self, msg: &Vec<u8>) -> bool;
    fn approve(&mut self, msg: Vec<u8>, signer: Principal) -> Result<u8, WalletError>;

    fn sign(self, msg: Vec<u8>, signer_implementation: &dyn Signer) -> Result<Vec<u8>, WalletError>;
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Wallet {
    signers: Vec<Principal>,
    threshold: u8,
    // message => already signed
    message_queue: HashMap<Vec<u8>, Vec<Principal>>,
}

impl Default for Wallet {
    fn default() -> Self {
        Wallet {
            signers: Vec::new(),
            threshold: 0,
            message_queue: HashMap::new(),
        }
    }
}

impl MultiSignatureWallet for Wallet {
    fn add_signer(&mut self, signer: Principal) {
        self.signers.push(signer);
    }

    fn remove_signer(&mut self, signer: Principal) {
        if let Some(index) = self.signers.iter().position(|&s| s == signer) {
            self.signers.remove(index);
        }
    }

    fn get_signers(&self) -> Vec<Principal> {
        self.signers.clone()
    }

    fn set_default_threshold(&mut self, threshold: u8) -> Result<(), WalletError> {
        if self.signers.len() < threshold as usize {
            return Err(WalletError::NotEnoughSigners);
        }
        self.threshold = threshold;
        Ok(())
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

    fn sign(self, msg: Vec<u8>, signer_implementation: &dyn Signer) -> Result<Vec<u8>, WalletError> {
        if !self.can_sign(&msg) {
            return Err(WalletError::CantSign);
        }
        match self.can_sign(&msg) {
            true => Ok(signer_implementation.sign(msg).map_err(|_| WalletError::CantSign)?),
            false => Err(WalletError::CantSign),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Principal;
    use std::str::FromStr;
    use crate::signer::TestSigner;

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
    fn test_sign_can_sign() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];
        wallet.propose_message(signer.clone(), msg.clone()).unwrap();

        let test_signer = TestSigner;
        let result = wallet.sign(msg.clone(), &test_signer);

        assert!(result.is_ok());
    }

    #[test]
    fn test_sign_cant_sign() {
        let mut wallet = Wallet::default();
        let signer = Principal::from_str("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        wallet.add_signer(signer.clone());

        let msg = vec![1, 2, 3];

        let test_signer = TestSigner;
        let result = wallet.sign(msg.clone(), &test_signer);

        assert_eq!(result.err(), Some(WalletError::CantSign));
    }
}
