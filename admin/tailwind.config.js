/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:       '#3D1225',
          'primary-hover': '#5C2040',
          copper:        '#C49A6C',
          'copper-light': '#E8D5B7',
          'copper-dark':  '#A07845',
          bg:            '#FAF6F1',
          blush:         '#F5E0E8',
          muted:         '#8C7378',
          /* kept for any legacy class references */
          rose:          '#C49A6C',
          'rose-light':  '#E8D5B7',
          'rose-dark':   '#A07845',
          gold:          '#3D1225',
          dark:          '#1E1B2E',
          gray:          '#2C3E50',
        },
      },
      fontFamily: {
        sans:    ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        card:         '0 4px 20px rgba(61,18,37,0.06)',
        'card-hover': '0 8px 30px rgba(61,18,37,0.12)',
        'glow-rose':  '0 0 40px rgba(196,154,108,0.35)',
        'glow-copper': '0 0 40px rgba(196,154,108,0.35)',
        'dark-card':  '0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        floatDelayed: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
      },
      animation: {
        float:          'float 5s ease-in-out infinite',
        'float-delayed': 'floatDelayed 7s ease-in-out infinite',
        shimmer:        'shimmer 2.5s linear infinite',
        'fade-in':      'fadeIn 0.4s ease-out forwards',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
