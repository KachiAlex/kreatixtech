/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#111213',
          light: '#2b2d2f',
        },
        orange: {
          DEFAULT: '#F2782E',
          deep: '#E0641C',
          light: '#FDF1E8',
        },
        offwhite: '#FAF9F7',
        border: '#EAE8E4',
        'gmail-bg': '#FAF9F7',
        'gmail-sidebar': '#FAF9F7',
        'gmail-active': '#FDF1E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
