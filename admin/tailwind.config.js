/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          rose: '#D4509F',
          'rose-light': '#F5D0EB',
          'rose-dark': '#A83380',
          gold: '#F4D03F',
          'gold-light': '#FAF0B0',
          'gold-dark': '#C8A500',
          dark: '#1E1B2E',
          gray: '#2C3E50'
        }
      },
      fontFamily: {
        sans: ['Nunito Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(212, 80, 159, 0.08)',
        'card-hover': '0 8px 30px rgba(212, 80, 159, 0.18)',
        'glow-rose': '0 0 40px rgba(212, 80, 159, 0.35)',
        'glow-gold': '0 0 40px rgba(244, 208, 63, 0.35)',
        'dark-card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' }
        },
        floatDelayed: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-2deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-delayed': 'floatDelayed 7s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
