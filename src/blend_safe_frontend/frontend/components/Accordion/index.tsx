import cn from 'classnames';
import type { FC, ReactNode } from 'react';
import React from 'react';
import type { IAccordionContent } from './Content';
import AccordionContent from './Content';
import { AccordionContext } from './context';
import type { IAccordionHeader } from './Header';
import { AccordionHeader } from './Header';

interface IContainer {
  expanded?: boolean;
  id?: string | number;
  onClick?: (id?: string | number) => void;
  defaultExpanded?: boolean;
  children?: ReactNode;
  color?: 'success' | 'danger' | 'warning' | 'base';
  className?: string;
}

const BorderColorMap: Record<string, string> = {
  success: 'border-success-content',
  warning: 'border-warning-content',
  danger: 'border-error-content',
  base: 'border-neutral',
};

export const Container = ({
  id,
  expanded,
  onClick,
  className,
  color = 'base',
  children,
}: IContainer) => {
  const borderColor = color && BorderColorMap[color];

  return (
    <AccordionContext.Provider
      value={{
        id,
        expanded,
        onClick,
        color,
      }}>
      <div
        className={cn(
          'overflow-hidden rounded-lg border',
          borderColor,
          className
        )}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface IAccordion {
  Container: FC<IContainer>;
  Header: FC<IAccordionHeader>;
  Content: FC<IAccordionContent>;
}

export const Accordion: IAccordion = {
  Container,
  Header: AccordionHeader,
  Content: AccordionContent,
};
