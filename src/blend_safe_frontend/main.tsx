import { createClient } from "@connect2ic/core";
import { defaultProviders } from "@connect2ic/core/providers";
import { Connect2ICProvider } from "@connect2ic/react";
import React from "react";
import ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import Account from "./pages/account";
import CreateAccount from "./pages/create-account";
import "./styles/global.css";
import {idlFactory, canisterId} from "../declarations/blend_safe_backend";
const client = createClient({
  canisters: {
    "blend_safe_backend": {
      canisterId,
      //@ts-ignore
      idlFactory
    }
  },
  //@ts-ignore
  providers: defaultProviders,
  globalProviderConfig: {
    dev: process.env.NODE_ENV === "development",
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/account/:address",
    element: <Account />,
  },
  {
    path: "/account/create",
    element: <CreateAccount />,
  },
]);

ReactDOM.render(
  <React.StrictMode>
    <Connect2ICProvider client={client}>
      <RouterProvider router={router} />
    </Connect2ICProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
