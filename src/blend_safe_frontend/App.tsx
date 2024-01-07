import React from "react";
/*
 * Connect2ic provides essential utilities for IC app development
 */
import { createClient } from "@connect2ic/core";
import { defaultProviders } from "@connect2ic/core/providers";
import "@connect2ic/core/style.css";
import { ConnectDialog, useConnect } from "@connect2ic/react";
/*
 * Import canister definitions like this:
 */
// import * as counter from '../.dfx/local/canisters/counter';
/*
 * Some examples to get you started
 */
import ConnectWallet from "./components/ConnectWallet";
import Welcome from "./components/Welcome";

import { MainLayout } from "./layouts";

function App() {
  const { isConnected, principal, activeProvider } = useConnect();

  return (
    <MainLayout title={"Blendsafe"} description={""}>
      <div className="container mx-auto mt-5 min-w-[600px] max-w-[820px] overflow-hidden p-3">
        {isConnected ? <Welcome /> : <ConnectWallet />}
      </div>
      <ConnectDialog />
    </MainLayout>
  );

  // return (
  //   <div className='App'>
  //     <div className='auth-section'>
  //       <ConnectButton />
  //     </div>
  //     <ConnectDialog />

  //     <header className='App-header'>
  //       {/* <img src={logo} className='App-logo' alt='logo' /> */}
  //       <p className='slogan'>React+TypeScript Template</p>
  //       <p className='twitter'>
  //         by <a href='https://twitter.com/miamaruq'>@miamaruq</a>
  //       </p>
  //     </header>

  //     <p className='examples-title'>Examples</p>
  //     <div className='examples'>
  //       <Counter />
  //       <Profile />
  //       <Transfer />
  //     </div>
  //   </div>
  // );
}

export default () => (
  <div className="relative overflow-x-hidden">
    <App />
  </div>
);
