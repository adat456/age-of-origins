/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'darkest': '#20232D',
      'dark': '#2C3144',
      'medium': '#394260',
      'light': '#525B7A',
      'lightest': '#A3AAC2',
      'offwhite': '#E0E3EB',
      'mutedred': '#943838',
      'red': '#BE2828',
    },
    spacing: {
      '4': '4px',
      '8': '8px',
      '16': '16px',
      '24': '24px',
      '32': '32px',
      '48': '48px',
      '64': '64px',
      '80': '80px'
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      'alfa': ['Alfa Slab One', 'sans-serif']
    },
    extend: {
    },
  },
  plugins: [],
}

