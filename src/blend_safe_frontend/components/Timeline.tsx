import cn from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

interface ITimeline {
  children?: ReactNode;
}

interface IItem {
  status?: 'active' | 'completed' | null;
  children?: ReactNode;
}

const Item = ({ status, children }: IItem) => {
  return (
    <li
      data-content={status === 'completed' ? '✓' : ''}
      className={cn(
        'step !min-h-0 !gap-0 py-2 text-start before:!h-[120%] before:!w-[1px] after:!h-4 after:!w-4 after:border-[0.1rem] after:!bg-white after:!text-[0.6rem]',
        {
          'after:border-base-content': status === 'completed',
          'after:border-secondary': status === 'active',
          'text-neutral after:border-neutral':
            !status || !['completed', 'active'].includes(status),
        }
      )}>
      {children}
    </li>
  );
};

export const Timeline = ({ children }: ITimeline) => {
  return <ul className='steps steps-vertical'>{children}</ul>;
};

Timeline.Item = Item;
