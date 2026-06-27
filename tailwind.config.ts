import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f0f7f0',
          100: '#dcecdc',
          500: '#2d9e6b',
          600: '#24835a',
          700: '#1c6647',
        },
      },
    },
  },
  plugins: [],
};

export default config;
