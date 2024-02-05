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
const amountInEtherToSend = "0.000000000001";
const chainId = 5; // goerli
const receiver = "0x5Ac014CB02e290562e608A94C1f5033Ea54e9243";

async function sendNativeToSomeone(canister: any) {
  const safe = new BlendSafe(canister, safeName);

  /** 1. Send eth from safe to someone **/

  const transaction = await safe.prepareSendEthTransaction(
    receiver,
    amountInEtherToSend
  );
  console.log(
    safe.getEthTransactionHashFromTransactionObject(transaction, chainId)
  );
  console.log(JSON.stringify(transaction));
  console.log(await safe.getEthAddress());

  const txHash = safe.getEthTransactionHashFromTransactionObject(
    transaction,
    chainId
  );

  await safe.propose(txHash);
  await safe.approve(txHash);
  const receipt = await safe.signAndBroadcastTransaction(transaction, chainId);
  console.log(receipt);
}

async function sendERC20ToSomeone(canister: any) {
  const safe = new BlendSafe(canister, safeName);

  /** 2. Send eth from safe to someone **/
  const erc20Address = "0x..."; // Replace with the ERC20 contract address
  const amountOfTokens = "100"; // The amount of tokens to transfer
  const tokenDecimals = 18; // Number of decimals the token uses
  const erc20ReceiverAddress = "0x..."; // Replace with the receiver's address

  const erc20Transaction = await safe.prepareERC20Transfer(
    erc20Address,
    erc20ReceiverAddress,
    amountOfTokens,
    tokenDecimals
  );
  const txHash2 = safe.getEthTransactionHashFromTransactionObject(
    erc20Transaction,
    chainId
  );
  await safe.propose(txHash2);
  await safe.approve(txHash2);
  const receipt2 = await safe.signAndBroadcastTransaction(
    erc20Transaction,
    chainId
  );
  console.log(receipt2);
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
