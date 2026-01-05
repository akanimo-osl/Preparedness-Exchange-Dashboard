/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        fellix: ["Fellix", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: '#020A1C',
          LIGHT: "#071327",
          LIGHTER: '#0C7AE91A',
        },
        secondary: {
          DEFAULT: '#F9982F',
          HOVER: '#6b3d00'
        }
      }
    },
  },
  plugins: [],
}