/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rojo de la bandera del Perú
        brand: {
          50: '#ffe6e8',
          100: '#ffc9ce',
          500: '#e8283a',
          600: '#d91023',
          700: '#b30d1d',
          800: '#8a0a17',
        },
        ink: '#111111',
        crema: '#fff4db',
        inti: '#ffc20e', // sol andino / maíz
        turq: '#00b5b8', // lagunas y textiles
        magenta: '#c2006b', // aguayos y mantas
        morado: '#5b2a86', // Señor de los Milagros
        selva: '#1b9e4b',
        help: '#00b5b8',
        offer: '#1b9e4b',
        map: '#c2006b',
      },
      boxShadow: {
        'brut-sm': '2px 2px 0 0 #111111',
        brut: '4px 4px 0 0 #111111',
        'brut-lg': '7px 7px 0 0 #111111',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'Arial Black', 'sans-serif'],
        sans: ['Archivo', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
