/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brown': {
          DEFAULT: '#914F1E',
        },
        'tan': {
          DEFAULT: '#DEAC80',
        },
        'cream': {
          DEFAULT: '#F7DCB9',
        },
        'sage': {
          DEFAULT: '#B5C18E',
        }
      }
    },
  },
  plugins: [],
}
