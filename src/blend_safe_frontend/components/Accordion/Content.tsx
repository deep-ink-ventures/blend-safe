import cn from 'classnames';
import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useAccordionContext } from './context';

export interface IAccordionContent {
  children?: ReactNode;
  className?: string;
  onExpand?: () => void;
}

const AccordionContent = ({ children, className, onExpand }: IAccordionContent) => {
  const { expanded } = useAccordionContext();

  useEffect(() => {
    if (expanded && onExpand) {
      onExpand()
    }
  }, [expanded])
 
  return (
    <div
      className={cn(
        'opacity-1 duration-5000 flex bg-base-100 transition-all ease-in-out',
        {
          '!h-[0px] min-h-[0px] overflow-hidden  opacity-0': !expanded,
          'min-h-[100px] p-2': expanded,
        },
        className
      )}>
      {children}
    </div>
  );
};

export default AccordionContent;
