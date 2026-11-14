/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandYellow: '#F5BF23',
        geminiBlue: '#0085FF',
        canvasBg: '#EDF4FC',
      },
      fontFamily: {
        brand: ['Montserrat', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
