import React from 'react';

interface IAvatar {
  src?: string;
  width?: number;
  height?: number;
}

export const Avatar = ({ src = '', width = 120, height = 120 }: IAvatar) => {
  return (
    <div className='relative flex w-fit items-center justify-center overflow-hidden rounded-full border'>
      <img src={src} alt='avatar' width={width} height={height} />
    </div>
  );
};
