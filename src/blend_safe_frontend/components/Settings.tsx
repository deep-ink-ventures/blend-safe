import { Principal } from "@dfinity/principal";
import cn from "classnames";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Wallet } from "../../declarations/blend_safe_backend/blend_safe_backend.did";
import { useSafe } from "../context/Safe";
import { usePromise } from "../hooks/usePromise";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { SignersForm } from "./SignersForm";
import { SigningThresholdForm } from "./SigningThresholdForm";

const SettingsTabs: Array<{ id: string; label: string }> = [
  {
    id: "addSigner",
    label: "Add a signer",
  },
  {
    id: "removeSigner",
    label: "Remove a signer",
  },
  {
    id: "threshold",
    label: "Change the threshold",
  },
];

const Settings = ({
  address,
  refreshTransactions,
  wallet,
}: {
  address: string;
  refreshTransactions?: () => void;
  wallet?: Wallet | null;
}) => {
  const { safe } = useSafe();

  const [activeSettingsTab, setActiveSettingsTab] = useState(
    SettingsTabs.at(0)?.id
  );

  const addSigner = usePromise({
    promiseFunction: async (signerAddresses: string[]) => {
      try {
        await Promise.all(
          signerAddresses.map(async (signerAddress) => {
            const principalFromText = Principal.fromText(signerAddress);
            await safe.addSigner(principalFromText);
          })
        );
        refreshTransactions && refreshTransactions();
        toast.success("Add signer messages created");
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const removeSigners = usePromise({
    promiseFunction: async (signerAddresses: string[]) => {
      try {
        await Promise.all(
          signerAddresses.map(async (signerAddress) => {
            const principalFromText = Principal.fromText(signerAddress);
            await safe.removeSigner(principalFromText);
          })
        );
        refreshTransactions && refreshTransactions();
        toast.success("Remove signer messages created");
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const setThreshold = usePromise({
    promiseFunction: async (threshold: number) => {
      try {
        await safe.setThreshold(Number(threshold));
        refreshTransactions && refreshTransactions();
        toast.success("Set threshold message created");
      } catch (ex) {
        toast.error(ex.toString());
      }
    },
  });

  const handleAddSigner = (signers?: string[]) => {
    const walletSigners = wallet?.signers.map((signer) =>
      signer.toText().toLowerCase()
    );
    const updatedSigners = signers?.map((signer) => signer.toLowerCase());
    const newSigners = updatedSigners?.filter(
      (newSigner) => !walletSigners?.includes(newSigner)
    );
    if (!!newSigners?.length) {
      addSigner.call(newSigners);
    }
  };

  const handleRemoveSigners = (signers?: string[]) => {
    const walletSigners = wallet?.signers.map((signer) =>
      signer.toText().toLowerCase()
    );
    const remainingSigners = signers?.map((signer) => signer.toLowerCase());
    const removedSigners = walletSigners?.filter(
      (walletSigner) => !remainingSigners?.includes(walletSigner)
    );
    if (!!removedSigners?.length) {
      removeSigners.call(removedSigners);
    }
  };

  const handleUpdateThreshold = (threshold?: number) => {
    if (threshold && !isNaN(threshold)) {
      setThreshold.call(threshold);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <div className="text-2xl font-semibold">Settings</div>
      </div>
      <div>
        <div className="">
          <ul
            className="flex flex-wrap text-center text-sm "
            id="signers"
            role="tablist"
          >
            {SettingsTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  className={cn(
                    "inline-block rounded-t-lg  p-4 hover:bg-base-300",
                    {
                      "bg-base-200": activeSettingsTab === tab.id,
                    }
                  )}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  type="button"
                  role="tab"
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={cn("!mt-0 space-y-3 rounded-lg bg-base-200 p-4", {
            hidden: activeSettingsTab !== SettingsTabs.at(0)?.id,
          })}
        >
          <SignersForm
            title="Add Signer"
            address={address}
            onSubmit={(data) =>
              handleAddSigner(data.signers?.map((signer) => signer?.address))
            }
            className={cn({
              hidden: addSigner.pending,
            })}
            disableRemove
          />
          {addSigner.pending && <LoadingPlaceholder />}
        </div>

        <div
          className={cn("!mt-0 space-y-3 rounded-lg bg-base-200 p-4", {
            hidden: activeSettingsTab !== SettingsTabs.at(1)?.id,
          })}
        >
          <SignersForm
            address={address}
            onSubmit={(data) =>
              handleRemoveSigners(
                data.signers?.map((signer) => signer?.address)
              )
            }
            className={cn({
              hidden: removeSigners.pending,
            })}
            disableAdd
          />
          {removeSigners.pending && <LoadingPlaceholder />}
        </div>

        <div
          className={cn("!mt-0 space-y-3 rounded-lg bg-base-200 p-4", {
            hidden: activeSettingsTab !== SettingsTabs.at(2)?.id,
          })}
        >
          <SigningThresholdForm
            threshold={wallet?.threshold}
            max={wallet?.signers.length}
            onSubmit={(data) => handleUpdateThreshold(data.threshold)}
          />
        </div>
      </div>
    </>
  );
};

export default Settings;
