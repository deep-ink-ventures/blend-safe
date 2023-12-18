use libsecp256k1::{Message, recover, RecoveryId, Signature};

pub fn find_recovery_id(msg: &[u8], sig: &[u8], known_pubkey: [u8; 65]) -> Option<u8> {
    let message = Message::parse_slice(msg).expect("Invalid message");

    // Try both possible recovery IDs
    for rec_id in [0u8, 1u8].iter() {
        let recovery_id = RecoveryId::parse(*rec_id).expect("Invalid recovery ID");
        let signature = Signature::parse_overflowing_slice(sig).expect("Invalid signature");

        // Attempt to recover the public key
        if let Ok(pubkey) = recover(&message, &signature, &recovery_id) {
            // Serialize and compare the recovered public key with the known public key
            if pubkey.serialize() == known_pubkey {
                return Some(*rec_id);
            }
        }
    }
    None
}

