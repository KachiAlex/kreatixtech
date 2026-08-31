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
        'splash-logo': 'splashLogo 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'splash-fade': 'splashFade 0.6s ease-in 2.2s forwards',
        'splash-text': 'splashText 0.8s ease-out 1s forwards',
        'splash-tagline': 'splashTagline 0.8s ease-out 1.4s forwards',
        'splash-progress': 'splashProgress 1.8s ease-in-out 0.5s forwards',
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
        splashLogo: {
          '0%':   { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.15) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        splashFade: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden' },
        },
        splashText: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        splashTagline: {
          '0%':   { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '0.7' },
        },
        splashProgress: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};