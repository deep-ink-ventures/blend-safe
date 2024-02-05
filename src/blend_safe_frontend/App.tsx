import React from "react";

import "@connect2ic/core/style.css";
import { ConnectDialog, useConnect } from "@connect2ic/react";

import ConnectWallet from "./components/ConnectWallet";
import Welcome from "./components/Welcome";

import { useCanister } from "@connect2ic/react";
import "react-toastify/dist/ReactToastify.css";
import BlendSafe from "./blend_safe";
import { LoadingPlaceholder } from "./components";
import { MainLayout } from "./layouts";

/** SAMPLES */
const safeName = "CHPTEST1";
const chainId = 5; // goerli
const receiver = "0x5Ac014CB02e290562e608A94C1f5033Ea54e9243";

async function flow(safe:any, transaction: any) {
  const txHash = safe.getEthTransactionHashFromTransactionObject(transaction, chainId)
  const txJson = JSON.stringify(transaction);

  await safe.propose(txHash);
  await safe.addMetadataToMessage(txHash, txJson);

  const txJsonReturned = JSON.parse(await safe.getMetadataForMessage(txHash));
  console.log(txHash == safe.getEthTransactionHashFromTransactionObject(txJsonReturned, chainId));
  console.log(safe.decodeTransaction(txJsonReturned))

  await safe.approve(txHash);
  const receipt = await safe.signAndBroadcastTransaction(transaction, chainId);
  console.log(receipt);
}

async function sendNativeToSomeone(canister: any) {
  const safe = new BlendSafe(canister, safeName);
  const amountInEtherToSend = "0.000000000001";

  /** 1. Send eth from safe to someone **/
  const transaction = await safe.prepareSendEthTransaction(
    receiver,
    amountInEtherToSend
  );

  await flow(safe, transaction);
}

async function sendERC20ToSomeone(canister: any) {
  const safe = new BlendSafe(canister, safeName);

  /** 2. Send erc20 from safe to someone **/
  const erc20Address = "0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc";
  const amountOfTokens = "10";
  const tokenDecimals = 18;

  const transaction = await safe.prepareERC20Transfer(
    erc20Address,
    receiver,
    amountOfTokens,
    tokenDecimals
  );

  await flow(safe, transaction);
}

function App() {
  const { isConnected, isConnecting, isInitializing } = useConnect();
  const [canister] = useCanister("blend_safe_backend");

  return (
    <MainLayout title={"Blendsafe"} description={""}>
      {(isConnecting || isInitializing) && <LoadingPlaceholder />}
      {!isConnecting && !isInitializing && (
        <>
          {isConnected ? (
            <a onClick={() => sendNativeToSomeone(canister)}>sample()</a>
          ) : null}
          <div className="container mx-auto mt-5 min-w-[600px] max-w-[820px] overflow-hidden p-3">
            {isConnected ? <Welcome /> : <ConnectWallet />}
          </div>
        </>
      )}
      <ConnectDialog />
    </MainLayout>
  );
}

export default () => (
  <div className="relative overflow-x-hidden">
    <App />
  </div>
);
