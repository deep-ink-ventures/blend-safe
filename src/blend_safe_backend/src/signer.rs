/// Trait for signing messages.
pub trait Signer {
    /// Sign a message and return the signature.
    ///
    /// # Arguments
    ///
    /// * `msg`: The message to be signed.
    ///
    /// # Returns
    ///
    /// A `Result` containing the signature if successful, or a `SigningError` if signing fails.
    fn sign(&self, msg: Vec<u8>) -> Result<Vec<u8>, SigningError>;
}

/// Error type for signing operations.
#[derive(Debug, PartialEq)]
pub enum SigningError {
    /// Invalid signature error.
    InvalidSignature,
    /// Message already queued error.
    MsgAlreadyQueued,
}

/// A test signer that always succeeds and returns a dummy signature.
pub struct TestSigner;

impl Signer for TestSigner {
    fn sign(&self, _msg: Vec<u8>) -> Result<Vec<u8>, SigningError> {
        // This is a dummy implementation that always succeeds and returns an empty signature.
        Ok(Vec::new())
    }
}
