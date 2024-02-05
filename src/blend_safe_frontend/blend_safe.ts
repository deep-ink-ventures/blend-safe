import {blend_safe_backend} from "../declarations/blend_safe_backend";
import {Principal} from "@dfinity/principal";
import Web3 from "web3";
import {Transaction} from 'ethereumjs-tx';

interface TransactionObject {
    to: string;
    gasPrice: string;
    gas: string;
    nonce: string;
    value?: string; // Optional since it might not be included in all transactions
    data?: string; // encoded ABI, optional as well
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

    async sign(txHash: string): Promise<void> {
        const result = await this.canister.sign(this.walletId, txHash);
        if (result.Err) {
            throw new Error(result.Err);
        }
        return result.Ok;
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

    async addMetadataToMessage(txHash: string, metadata: string): Promise<void> {
        const result = await this.canister.add_metadata(this.walletId, txHash, metadata);
        if (result.Err) {
            throw new Error(result.Err);
        }
    }

    async getMetadataForMessage(txHash: string): Promise<string> {
        const result = await this.canister.get_metadata(this.walletId, txHash);
        if (result.Err) {
            throw new Error(result.Err);
        }
        return result.Ok;
    }

    async getBasicEthTransactionObject(receiver: string): Promise< TransactionObject> {
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

    async prepareSendEthTransaction(receiver: string, amountInEth: string): Promise< TransactionObject> {
        const baseTransaction = await this.getBasicEthTransactionObject(receiver);
        const valueInWei = BigInt(this.web3.utils.toWei(amountInEth, 'ether'));
        baseTransaction.value = this.web3.utils.toHex(valueInWei);
        return baseTransaction;
    }


    async prepareERC20Transfer(
        contractAddress: string,
        receiverAddress: string,
        amountOfTokens: string,
        tokenDecimals?: number
    ): Promise<TransactionObject> {
        const erc20ABI = [
            // ... other ERC20 functions ...
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ];

        if (tokenDecimals === undefined) {
            const contract = new this.web3.eth.Contract(erc20ABI, contractAddress);
            tokenDecimals = await contract.methods.decimals().call();
            if (tokenDecimals === undefined) {
                throw new Error("Token decimals not provided and cannot be fetched from contract");
            }
        }

        const tokenAmountInSmallestUnit = BigInt(amountOfTokens) * BigInt(10 ** tokenDecimals);

        return this.prepareSmartContractEthTransaction(
            contractAddress,
            erc20ABI,
            'transfer',
            [receiverAddress, tokenAmountInSmallestUnit.toString()],
            contractAddress,
            '0'
        );
    }

     async prepareSmartContractEthTransaction(
        contractAddress: string,
        contractABI: any[], // ABI of the contract
        methodName: string,
        methodArgs: any[], // Arguments for the method
        receiver: string, // Receiver address
        amountInEth?: string // Amount in ETH to send, if applicable
    ): Promise<TransactionObject> {
        const contract = new this.web3.eth.Contract(contractABI, contractAddress);
        const method = contract.methods[methodName](...methodArgs);
        const encodedABI = method.encodeABI();

        const baseTransaction = await this.getBasicEthTransactionObject(receiver);

        if (amountInEth) {
            const valueInWei = BigInt(this.web3.utils.toWei(amountInEth, 'ether'));
            baseTransaction.value = this.web3.utils.toHex(valueInWei);
        }

        return {
            ...baseTransaction,
            to: contractAddress,
            data: encodedABI
        };
    }

    getEthTransactionHashFromTransactionObject(transaction: Object, chainId: number) {
        const tx = new Transaction(transaction, { chain: chainId });
        return tx.hash(false).toString('hex')
    }

    async signTransaction(transaction: Object, chainId: number): Promise<String> {
        const tx = new Transaction(transaction, { chain: chainId });

        // Hash the transaction and send it to the signing service
        const result = await this.sign(tx.hash(false).toString('hex'));
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
