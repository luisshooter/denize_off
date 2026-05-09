/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          rose: '#D4509F',
          'rose-light': '#FDF0F8',
          'rose-dark': '#A83380',
          gold: '#C4A45A',
          'gold-light': '#FDF6E8',
          'gold-dark': '#9A7D35',
          dark: '#1E1B2E',
          cream: '#FFF8F3',
          sand: '#EFE3D8',
          muted: '#9B8FA0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      boxShadow: {
        'card': '0 2px 12px rgba(30,27,46,0.07)',
        'card-hover': '0 12px 40px rgba(30,27,46,0.14)',
        'rose': '0 4px 20px rgba(212,80,159,0.28)',
      }
    }
  },
  plugins: []
};
