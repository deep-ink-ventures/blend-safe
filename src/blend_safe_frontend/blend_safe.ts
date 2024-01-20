import {blend_safe_backend} from "../declarations/blend_safe_backend";
import {Principal} from "@dfinity/principal";
import Web3 from "web3";
import {Transaction} from 'ethereumjs-tx';

// todo: move to config
export const PROVIDER =  "https://goerli.infura.io/v3/1aa49601abc34fce881a9934647b806a"

class BlendSafe {
    walletId: string;
    web3: Web3;
    private canister: typeof blend_safe_backend;

    constructor(canister: typeof blend_safe_backend, walletId: string) {
        this.walletId = walletId;
        this.canister = canister
        this.web3 = new Web3(PROVIDER);
    }

    async createWallet(principals: Array<Principal>, threshold: number): Promise<void> {
        const result = await this.canister.create_wallet(this.walletId, principals, threshold);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    async getWallet() {
        return await this.canister.get_wallet(this.walletId);
    }

    async getEthAddress() {
        const result = await this.canister.eth_address(this.walletId);
        if (result.Err) {
            throw new Error(result.Err);
        }
        return result.Ok;
    }

    async propose(txHash: string): Promise<void> {
        const result = await this.canister.propose(this.walletId, txHash);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    async approve(txHash: string): Promise<void> {
        const result = await this.canister.approve(this.walletId, txHash);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    getEthTransactionHashFromTransactionObject(transaction: Object, chainId: number) {
        const tx = new Transaction(transaction, { chain: chainId });
        return tx.hash(false).toString('hex')
    }

    async signTransaction(transaction: Object, chainId: number): Promise<Object> {
       const tx = new Transaction(transaction, { chain: chainId });

        // Hash the transaction and send it to the signing service
        const result = await this.canister.sign(this.walletId, tx.hash(false).toString('hex'));
        if (result.Err) {
            throw new Error(result.Err);
        }

        // Decode the signature
        const signatureEnc = result.Ok;
        const signature = Buffer.from(signatureEnc, 'hex');

        // Extract r, s, and calculate v
        const r = signature.slice(0, 32);
        const s = signature.slice(32, 64);
        const recoveryId = signature[64];
        const v = chainId * 2 + 35 + recoveryId;

        // Set the signature in the transaction
        tx.r = r;
        tx.s = s;
        tx.v = Buffer.from([v]);

        // Serialize the transaction
        return '0x' + tx.serialize().toString('hex');
    }

    // Retrieve all messages that can be signed
    async getMessagesToSign() {
        const result = await this.canister.get_messages_to_sign(this.walletId);
        if (result.Err) {
            throw new Error(result.Err);
        }
        return result.Ok;
    }

    // Retrieve all proposed messages
    async getProposedMessages() {
        const result = await this.canister.get_proposed_messages(this.walletId);
        if (result.Err) {
            throw new Error(result.Err);
        }
        return result.Ok;
    }

    // Retrieve all proposed messages with their signers
    async getMessagesWithSigners() {
        const result = await this.canister.get_messages_with_signers(this.walletId);
        if (result.Err) {
            throw new Error(result.Err);
        }
        return result.Ok;
    }

}

export default BlendSafe;
