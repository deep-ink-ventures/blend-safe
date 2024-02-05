import cn from "classnames";
import React, { ReactNode } from "react";

interface IModalProps {
  isVisible?: boolean;
  children?: ReactNode;
  onClose?: () => void;
  onSuccess?: () => void;
}

const Title = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="my-3 w-full text-center">
      <h1 className="text-2xl">{children}</h1>
    </div>
  );
};

export const Modal = (props: IModalProps) => {
  const { isVisible, onClose, children } = props;

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-[900] flex h-full w-full items-center justify-center",
        {
          hidden: !isVisible,
        }
      )}
    >
      <div
        className="absolute h-full w-full bg-black opacity-50"
        onClick={() => {
          if (onClose) {
            onClose();
          }
        }}
      />
      <div className="z-[1050] flex flex-col items-center justify-center gap-5 rounded-lg bg-white p-8 opacity-100">
        <div className="w-full min-w-[600px] max-w-[820px] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.Header = Title;
