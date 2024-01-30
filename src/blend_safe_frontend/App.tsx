import React, {useEffect} from "react";

import "@connect2ic/core/style.css";
import {ConnectDialog, useConnect} from "@connect2ic/react";

import ConnectWallet from "./components/ConnectWallet";
import Welcome from "./components/Welcome";

import { MainLayout } from "./layouts";
import BlendSafe  from "./blend_safe";
import { useCanister } from "@connect2ic/react"
import 'react-toastify/dist/ReactToastify.css';


async function blendSafeSample(canister: any) {
    const walletId = "CHPTEST2"
    const safe = new BlendSafe(canister, walletId);

    const amountInEtherToSend = '0.000000000001'
    const chainId = 5 // goerli
    const receiver = "0x5Ac014CB02e290562e608A94C1f5033Ea54e9243"

    const transaction = await safe.prepareSendEthTransaction(receiver, amountInEtherToSend)
    console.log(JSON.stringify(transaction))

    const txHash = safe.getEthTransactionHashFromTransactionObject(transaction, chainId);

    await safe.propose(txHash);
    await safe.approve(txHash);
    const receipt = await safe.signAndBroadcastTransaction(transaction, chainId)
    console.log(receipt)
}

function App() {
  const { isConnected } = useConnect();
  const [canister] = useCanister("blend_safe_backend");

  return (
    <MainLayout title={"Blendsafe"} description={""}>
      {isConnected ? (
        <a onClick={() => blendSafeSample(canister)}>sample()</a>
      ) : null}
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
