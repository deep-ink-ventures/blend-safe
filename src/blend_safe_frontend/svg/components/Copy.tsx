import cn from 'classnames';
import React from 'react';
import type { SvgProps } from './SvgWrapper';
import { withSvgProps } from './SvgWrapper';

type ICopy = SvgProps;

const Copy = withSvgProps<ICopy>(({ className }) => {
  return (
    <svg
      className={cn('h-3 w-3 fill-black', className)}
      viewBox='0 0 17 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path d='M11.1668 0.666656H3.16683C2.4335 0.666656 1.8335 1.26666 1.8335 1.99999V11.3333H3.16683V1.99999H11.1668V0.666656ZM13.1668 3.33332H5.8335C5.10016 3.33332 4.50016 3.93332 4.50016 4.66666V14C4.50016 14.7333 5.10016 15.3333 5.8335 15.3333H13.1668C13.9002 15.3333 14.5002 14.7333 14.5002 14V4.66666C14.5002 3.93332 13.9002 3.33332 13.1668 3.33332ZM13.1668 14H5.8335V4.66666H13.1668V14Z' />
    </svg>
  );
});

export default Copy;