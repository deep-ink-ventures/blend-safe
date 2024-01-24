import Image from "next/image";
import plus from "../svg/plus.svg";

import { useCanister, useConnect } from "@connect2ic/react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlendSafe from "../blend_safe";
import { usePromise } from "../hooks/usePromise";
import Spinner from "../svg/components/Spinner";
import SelectAccount from "./SelectAccount";

const Welcome = () => {
  const navigate = useNavigate();
  const { principal } = useConnect();
  const [canister] = useCanister("blend_safe_backend");

  const handleCreateNewAccount = () => {
    navigate("/account/create");
  };

  const getWallet = usePromise({
    promiseFunction: async () => {
      const safe = new BlendSafe(canister as any, principal.substring(4));
      const response = await safe.getWallet();
      return response;
    },
  });

  useEffect(() => {
    if (principal) {
      getWallet.call();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="my-3">
        <h1 className="text-xl">Welcome to Blendsafe</h1>
      </div>

      <div className="my-5 flex w-full flex-col items-center justify-around space-y-7">
        {getWallet.pending ? (
          <Spinner className="my-2 h-12 w-12 fill-card-primary text-base-300" />
        ) : (
          <>
            {!Boolean(getWallet.value?.length) && (
              <div className="flex flex-col items-center justify-center">
                <button
                  className="btn btn-primary"
                  onClick={handleCreateNewAccount}
                >
                  <Image
                    src={plus}
                    width={17}
                    height={17}
                    alt="add one"
                    className="mr-2"
                  />
                  Create New Account
                </button>
              </div>
            )}
            <SelectAccount
              wallets={getWallet.value}
              walletAddress={principal}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Welcome;
