import React from 'react';
import type { SvgProps } from './SvgWrapper';
import { withSvgProps } from './SvgWrapper';

type ISwitch = SvgProps;

const Switch = withSvgProps<ISwitch>(({ className = 'fill-black' }) => {
  return (
    <svg
      className={className}
      viewBox='0 0 21 21'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path d='M10.0078 18C7.96094 18 6.19922 17.2617 4.72266 15.7852C3.24609 14.3086 2.50781 12.5469 2.50781 10.5V9.44531L1.07813 10.875C0.953125 11 0.804688 11.0586 0.632813 11.0508C0.460938 11.043 0.3125 10.9766 0.1875 10.8516C0.0625 10.7266 0 10.5742 0 10.3945C0 10.2148 0.0625 10.0625 0.1875 9.9375L2.71875 7.40625C2.79688 7.32813 2.875 7.27344 2.95313 7.24219C3.03125 7.21094 3.11719 7.19531 3.21094 7.19531C3.30469 7.19531 3.39063 7.21094 3.46875 7.24219C3.54688 7.27344 3.625 7.32813 3.70313 7.40625L6.25781 9.96094C6.38281 10.0859 6.44531 10.2344 6.44531 10.4062C6.44531 10.5781 6.38281 10.7266 6.25781 10.8516C6.13281 10.9766 5.98047 11.0391 5.80078 11.0391C5.62109 11.0391 5.46875 10.9766 5.34375 10.8516L3.91406 9.44531V10.5C3.91406 12.1719 4.51172 13.6055 5.70703 14.8008C6.90234 15.9961 8.33594 16.5938 10.0078 16.5938C10.3672 16.5938 10.7148 16.5703 11.0508 16.5234C11.3867 16.4766 11.7109 16.3984 12.0234 16.2891C12.1484 16.2578 12.2813 16.2539 12.4219 16.2773C12.5625 16.3008 12.6797 16.3594 12.7734 16.4531C12.9609 16.6406 13.0391 16.8438 13.0078 17.0625C12.9766 17.2812 12.8359 17.4375 12.5859 17.5312C12.1641 17.7031 11.7383 17.8242 11.3086 17.8945C10.8789 17.9648 10.4453 18 10.0078 18ZM16.7813 13.7578C16.6875 13.7578 16.6016 13.7422 16.5234 13.7109C16.4453 13.6797 16.3672 13.625 16.2891 13.5469L13.7578 11.0156C13.6328 10.8906 13.5703 10.7344 13.5703 10.5469C13.5703 10.3594 13.6328 10.2031 13.7578 10.0781C13.8828 9.95312 14.0391 9.89062 14.2266 9.89062C14.4141 9.89062 14.5703 9.95312 14.6953 10.0781L16.0781 11.4609V10.5C16.0781 8.82812 15.4805 7.39453 14.2852 6.19922C13.0898 5.00391 11.6563 4.40625 9.98438 4.40625C9.625 4.40625 9.27734 4.43359 8.94141 4.48828C8.60547 4.54297 8.28125 4.61719 7.96875 4.71094C7.84375 4.74219 7.71094 4.74219 7.57031 4.71094C7.42969 4.67969 7.3125 4.61719 7.21875 4.52344C7.03125 4.33594 6.95703 4.13281 6.99609 3.91406C7.03516 3.69531 7.17969 3.53906 7.42969 3.44531C7.85156 3.28906 8.27344 3.17578 8.69531 3.10547C9.11719 3.03516 9.54688 3 9.98438 3C12.0313 3 13.793 3.73828 15.2695 5.21484C16.7461 6.69141 17.4844 8.45312 17.4844 10.5V11.5078L18.9141 10.0781C19.0391 9.95312 19.1914 9.89062 19.3711 9.89062C19.5508 9.89062 19.7031 9.95312 19.8281 10.0781C19.9531 10.2031 20.0156 10.3555 20.0156 10.5352C20.0156 10.7148 19.9531 10.8672 19.8281 10.9922L17.2734 13.5469C17.1953 13.625 17.1172 13.6797 17.0391 13.7109C16.9609 13.7422 16.875 13.7578 16.7813 13.7578Z' />
    </svg>
  );
});

export default Switch;
