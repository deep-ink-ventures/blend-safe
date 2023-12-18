import cn from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

interface IIndicator {
  indicatorContent?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Indicator = ({
  indicatorContent,
  children,
  className,
}: IIndicator) => {
  return (
    <div className={cn('indicator', className)}>
      {indicatorContent && (
        <span className='badge indicator-item badge-secondary'>
          {indicatorContent}
        </span>
      )}
      <button className='btn aspect-square'>{children}</button>
    </div>
  );
};
