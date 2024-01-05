/** @type {import('tailwindcss').Config} */

const { transparent } = require('daisyui/src/colors');

module.exports = {
  content: ['./src/blend_safe_frontend/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    fontFamily: {
      primary: ['Poppins', 'sans-serif'],
    },
    extend: {
      colors: {
        white: '#FAFAFA',
        black: '#1A1829',
        content: {
          primary: '#FAF9F6',
        },
        card: {
          primary: '#262229',
        },
        base: {
          50: '#37323D',
        },
        'warning-light': '#FBF4ED',
        'success-light': '#eaf9eb',
        'error-light': '#fcded9',
      },
    },
  },
  // add daisyUI plugin
  // disable eslint because it will give Error: Unexpected require()
  /* eslint-disable */
  plugins: [require('daisyui')],

  // daisyUI config (optional)
  daisyui: {
    styled: true,
    themes: [
      {
        blendsafe: {
          // default
          default: '#2E2E2E',
          'default-outline': transparent,
          'default-hover': '#0D0D0D',
          'default-active': '#2E2E2E',
          'default-disabled': '#2E2E2E',

          primary: '#09821C',
          'primary-hover': '#09821C',
          'primary-disabled': '#84c18d',

          'primary-focus': '#065713',
          'primary-content': '#FAF9F6',
          secondary: '#FF7A00',
          'secondary-focus': '#D26400',
          'secondary-content': '#1E1B21',
          accent: '#A3E635',
          'accent-focus': '#87BB2B',
          'accent-content': '#1E1B21',
          neutral: '#C5C5C5',
          'neutral-focus': '#ABABAB',
          'neutral-content': '#1E1B21',
          'base-100': '#F3F2ED',
          'base-200': '#FAF9F6',
          'base-300': '#d9d7d3',
          'base-content': '#2E2E2E',
          // 'base-container': '#050215',
          info: '#CAEFFF',
          'info-content': '#002B3D',
          success: '#BFECC3',
          'success-content': '#002B3D',
          warning: '#FBEBDF',
          'warning-content': '#E16F1D',
          error: '#FBDFE5',
          'error-content': '#E11D48',

          '--border-btn': '0.5px',

          '.btn': {
            'box-shadow': '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
          '.btn-outline': {
            'border-color': '#C5C5C5',
          },
          '.btn-outline:hover': {
            'background-color': '#E0E0E0',
            color: '#2E2E2E',
          },
        },
      },
      'night',
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    darkTheme: 'blendsafe',
  },
};
