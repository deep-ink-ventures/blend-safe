import {blend_safe_backend} from "../declarations/blend_safe_backend";
import {Principal} from "@dfinity/principal";
import Web3 from "web3";
import {Transaction} from 'ethereumjs-tx';

interface EthTransaction {
    to: string;
    gasPrice: string;
    gas: string;
    nonce: string;
    value?: string; // Optional since it might not be included in all transactions
}

// todo: move to config
export const PROVIDER =  "https://goerli.infura.io/v3/1aa49601abc34fce881a9934647b806a"

class BlendSafe {
    walletId: string;
    web3: Web3;
    private canister: typeof blend_safe_backend;

    constructor(canister: typeof blend_safe_backend, walletId: string = 'default') {
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

    async addSigner(principal: Principal): Promise<void> {
        const result = await this.canister.add_signer(this.walletId, principal);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    async removeSigner(principal: Principal): Promise<void> {
        const result = await this.canister.remove_signer(this.walletId, principal);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    async setThreshold(threshold: number): Promise<void> {
        const result = await this.canister.set_threshold(this.walletId, threshold);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    async getWalletsForPrincipal(principal: Principal): Promise<Array<string>> {
        return await this.canister.get_wallets_for_principal(principal);
    }

    async getBasicEthTransactionObject(receiver: string): Promise<EthTransaction> {
        const wallet = await this.getEthAddress()

        const gasLimit = await this.web3.eth.estimateGas({
            from: wallet,
            to: receiver,
        });
        const gasPrice = await this.web3.eth.getGasPrice();
        const nonce = await this.web3.eth.getTransactionCount(wallet);

       return {
            to: receiver,
            gasPrice: this.web3.utils.toHex(gasPrice), // Gas price in wei, converted to hex
            gas: this.web3.utils.toHex(gasLimit), // Gas limit, converted to hex
            nonce: this.web3.utils.toHex(nonce), // Nonce, converted to hex
        };
    }

    async prepareSendEthTransaction(receiver: string, amountInEth: string): Promise<EthTransaction> {
        const baseTransaction = await this.getBasicEthTransactionObject(receiver);
        const valueInWei = BigInt(this.web3.utils.toWei(amountInEth, 'ether'));
        baseTransaction.value = this.web3.utils.toHex(valueInWei);
        return baseTransaction;
    }

    getEthTransactionHashFromTransactionObject(transaction: Object, chainId: number) {
        const tx = new Transaction(transaction, { chain: chainId });
        return tx.hash(false).toString('hex')
    }

    async signTransaction(transaction: Object, chainId: number): Promise<String> {
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

    async signAndBroadcastTransaction(transaction: Object, chainId: number): Promise<Object> {
        const signedTransaction = await this.signTransaction(transaction, chainId);
        // @ts-ignore
        return this.web3.eth.sendSignedTransaction(signedTransaction);
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
