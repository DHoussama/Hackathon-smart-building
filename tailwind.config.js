/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        usz: {
          blue: '#005596', // Approximate USZ Corporate Blue
          lightBlue: '#E6F0F8',
          dark: '#1A1A1A',
          gray: '#F5F5F5',
          green: '#28A745', // Accessible generic green
          accent: '#E3000F' // USZ Red Accent
        }
      }
    },
  },
  plugins: [],
}