/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4f1',
          100: '#ffe3db',
          200: '#ffc4b0',
          300: '#ff9a7a',
          400: '#ff6940',
          500: '#e84b2c',
          600: '#cc3317',
          700: '#a82710',
          800: '#8a2110',
          900: '#731e12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
