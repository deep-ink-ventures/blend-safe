import cn from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';

interface ICommonStepperProps {
  children?: ReactNode;
}

interface IStepProps extends ICommonStepperProps {
  completed?: boolean;
  active?: boolean;
  isLast?: boolean;
}

const Step = ({ active, completed, isLast, children }: IStepProps) => {
  return (
    <li
      className={cn(
        'flex items-center text-accent after:inline-block after:h-1 ',
        {
          'w-full after:w-full after:border-4 after:border-b  after:content-[""]':
            !isLast,
          'after:border-accent-focus': completed,
          'after:border-300': !completed,
        }
      )}>
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full fill-transparent stroke-white',
          {
            'bg-accent-focus': completed,
            'bg-neutral': !completed && !active,
            'bg-base-50': active,
          }
        )}>
        {children}
      </div>
    </li>
  );
};

const Stepper = ({ children }: ICommonStepperProps) => {
  return <ol className='flex w-full items-center'>{children}</ol>;
};

Stepper.Step = Step;

export default Stepper;
