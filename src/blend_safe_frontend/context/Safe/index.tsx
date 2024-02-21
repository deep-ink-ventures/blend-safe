import React, { createContext, ReactNode, useContext, useState } from "react";
import BlendSafe from "../../blend_safe";

interface SafeContextProps {
  safe: BlendSafe;
  setSafe: (safe: BlendSafe) => void;
}

const SafeContext = createContext<SafeContextProps | undefined>(undefined);

interface SafeProviderProps {
  children: ReactNode;
  setSafe: (safe: BlendSafe) => void;
  safe: BlendSafe;
}

const SafeProvider: React.FC<SafeProviderProps> = ({ safe, setSafe, children }) => {

  return (
    <SafeContext.Provider value={{ safe, setSafe }}>
      {children}
    </SafeContext.Provider>
  );
};

const useSafe = (): SafeContextProps => {
  const context = useContext(SafeContext);
  if (!context) {
    throw new Error("useSafe must be used within a SafeProvider");
  }
  return context;
};

export { SafeProvider, useSafe };
