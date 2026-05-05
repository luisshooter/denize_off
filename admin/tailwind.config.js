/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif']
      },
      boxShadow: {
        card: '0 4px 20px rgba(212, 80, 159, 0.08)',
        'card-hover': '0 8px 30px rgba(212, 80, 159, 0.18)'
      }
    }
  },
  plugins: []
};
