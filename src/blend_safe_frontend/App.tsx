import React from "react";

import "@connect2ic/core/style.css";
import {ConnectDialog, useConnect} from "@connect2ic/react";

import ConnectWallet from "./components/ConnectWallet";
import Welcome from "./components/Welcome";

import { MainLayout } from "./layouts";
import BlendSafe  from "./blend_safe";
import {Principal} from "@dfinity/principal";
import { useCanister } from "@connect2ic/react"



async function blendSafeSample(canister: any, principalId: string) {
    const principal = Principal.fromText(principalId);

    // random wallet id
    const walletId = (Math.random() + 1).toString(36).substring(4);
    console.log("walletId", walletId)

    const safe = new BlendSafe(canister, walletId);

    await safe.createWallet([principal], 1)
    console.log("wallet created ...")

    const wallet = await safe.getWallet()
    console.log("wallet", wallet)

    const AMOUNT_IN_ETHER = '0.00000051'
    const GAS = 2100000000
    const CHAIN_ID = 5 // goerli

    const walletAddress = await safe.getEthAddress();
    console.log("ethAddress", walletAddress)

     // Create a transaction object

    const transaction = {
        to: '0x5Ac014CB02e290562e608A94C1f5033Ea54e9243',
        value: safe.web3.utils.toHex(safe.web3.utils.toWei(AMOUNT_IN_ETHER, 'ether')),
        gas: safe.web3.utils.toHex(GAS),
        gasPrice: safe.web3.utils.toHex(await safe.web3.eth.getGasPrice()),
        nonce: safe.web3.utils.toHex(await safe.web3.eth.getTransactionCount(walletAddress)),
        chainId: CHAIN_ID
    };
    const txHash = safe.getEthTransactionHashFromTransactionObject(transaction, CHAIN_ID);
    await safe.propose(txHash);
    console.log(await safe.getProposedMessages());
    await safe.approve(txHash);
    console.log(await safe.getMessagesToSign());

    console.log(await safe.getMessagesWithSigners());
    const signedTransaction = await safe.signTransaction(transaction, CHAIN_ID)

    console.log("signed", signedTransaction)
}

function App() {
  const { isConnected, principal } = useConnect();
  const [canister] = useCanister("blend_safe_backend")
  return (
    <MainLayout title={"Blendsafe"} description={""}>
        {isConnected ? <a onClick={() => blendSafeSample(canister, principal)}>sample()</a> : null}
      <div className="container mx-auto mt-5 min-w-[600px] max-w-[820px] overflow-hidden p-3">
        {isConnected ? <Welcome /> : <ConnectWallet />}
      </div>
      <ConnectDialog />
    </MainLayout>
  );
}

export default () => (
  <div className="relative overflow-x-hidden">
    <App />
  </div>
);
