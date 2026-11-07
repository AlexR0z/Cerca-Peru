/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f3',
          100: '#fbe3e5',
          500: '#c4202e',
          600: '#a50f1c',
          700: '#8a0c17',
          800: '#6e0a12',
        },
        help: '#2563eb',
        offer: '#15803d',
        map: '#6d3fd1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
