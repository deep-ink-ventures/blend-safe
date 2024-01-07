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

const client = createClient({
  canisters: {
    // counter,
  },
  //@ts-ignore
  providers: defaultProviders,
  globalProviderConfig: {
    dev: import.meta.env.DEV === "true",
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
