/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#111213',
          light: '#2b2d2f',
        },
        grey: {
          DEFAULT: '#9CA0A6',
          dark: '#5C6066',
        },
        paper: '#FFFFFF',
        offwhite: '#FAF9F7',
        orange: {
          DEFAULT: '#F2782E',
          deep: '#E0641C',
          light: '#FDF1E8',
        },
        border: '#EAE8E4',
        line: 'rgba(34,36,38,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.03em',
        wide: '0.12em',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'scroll-left': 'scroll-left 40s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scroll-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};