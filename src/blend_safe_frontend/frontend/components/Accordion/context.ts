import { createContext, useContext } from 'react';

interface IAccordionContext {
  id?: string | number;
  expanded?: boolean;
  onClick?: (id?: string | number) => void;
  color?: 'success' | 'danger' | 'warning' | 'base';
}

export const AccordionContext = createContext<IAccordionContext | undefined>(
  undefined
);

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error(
      'AccordionContent should be used within Accordion component'
    );
  }

  return context;
};
