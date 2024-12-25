import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enable dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0d0d0d', // Darker background color
        foreground: '#f7fafc', // Light foreground color
      },
    },
  },
  plugins: [],
};

export default config;