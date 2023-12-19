import React from 'react';
import type { SvgProps } from './SvgWrapper';
import { withSvgProps } from './SvgWrapper';

type IEmptyBox = SvgProps;

const EmptyBox = withSvgProps<IEmptyBox>(({ className = 'fill-black' }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      x='0px'
      y='0px'
      width='100'
      height='100'
      viewBox='0 0 128 128'
      className={className}>
      <path fillOpacity={0} d='M112 34L64 17 16 34 16 94 64 111 112 94z'></path>
      <path
        fillOpacity={0}
        d='M112 34L64 17 16 34 16 94 64 111 112 94zM112 34L64 17'></path>
      <path d='M64,114c-0.3,0-0.7-0.1-1-0.2l-48-17c-1.2-0.4-2-1.6-2-2.8V34c0-1.3,0.8-2.4,2-2.8l48-17c1.6-0.6,3.3,0.3,3.8,1.8c0.6,1.6-0.3,3.3-1.8,3.8L19,36.1v55.8l46,16.3c1.6,0.6,2.4,2.3,1.8,3.8C66.4,113.2,65.2,114,64,114z'></path>
      <path fillOpacity={0} d='M112 34L64 17M112 34L64 17'></path>
      <path d='M115,33.9c0-0.1,0-0.3,0-0.4c0,0,0-0.1,0-0.1c-0.2-1-0.9-1.9-1.9-2.2l-24-8.5c0,0-0.1,0-0.1,0c-0.6-0.2-1.4-0.3-2.1,0L40,39.2c-1.2,0.4-2,1.6-2,2.8v11c0,1.7,1.3,3,3,3s3-1.3,3-3v-8.9l43.8-15.5L103,34L63,48.2c-1.2,0.4-2,1.5-2,2.8c0,0,0,0,0,0.1v55.8L19,91.9V36.1l46-16.3c1.6-0.6,2.4-2.3,1.8-3.8c-0.6-1.6-2.3-2.4-3.8-1.8l-48,17c-1.2,0.4-2,1.6-2,2.8v60c0,1.3,0.8,2.4,2,2.8l48,17c0,0,0,0,0,0c0.3,0.1,0.7,0.2,1,0.2c0.3,0,0.7-0.1,1-0.2l48-17c1.2-0.4,2-1.6,2-2.8L115,33.9C115,34,115,33.9,115,33.9z M109,91.9l-42,14.9V53.1l42-14.9V91.9z'></path>
    </svg>
  );
});

export default EmptyBox;
