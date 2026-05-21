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
        },
        masc: {
          dark: '#1C1917',
          darker: '#0C0A09',
          stone: '#44403C',
          'stone-light': '#78716C',
          gold: '#CA8A04',
          'gold-light': '#FEF08A',
          'gold-dim': '#A16207',
          smoke: '#57534E',
          cream: '#F5F0EB',
          wood: '#3D2B1F',
          'wood-light': '#5C3D2E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        'masc-display': ['Bodoni Moda', 'Georgia', 'serif'],
        'masc-body': ['Jost', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'smoke-drift': 'smokeDrift 8s ease-in-out infinite',
        'smoke-drift2': 'smokeDrift2 11s ease-in-out infinite',
        'gold-glow': 'goldGlow 3s ease-in-out infinite',
        'ember-float': 'emberFloat 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        smokeDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '33%':       { transform: 'translate(30px, -20px) scale(1.15)', opacity: '0.5' },
          '66%':       { transform: 'translate(-20px, 15px) scale(0.9)', opacity: '0.25' },
        },
        smokeDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.2' },
          '40%':      { transform: 'translate(-35px, 25px) scale(1.2)', opacity: '0.4' },
          '70%':      { transform: 'translate(25px, -18px) scale(0.85)', opacity: '0.15' },
        },
        goldGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(202,138,4,0.3)' },
          '50%':       { boxShadow: '0 0 30px rgba(202,138,4,0.6)' },
        },
        emberFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '50%':       { transform: 'translateY(-20px) scale(0.8)', opacity: '0.3' },
        },
      },
      boxShadow: {
        'card': '0 2px 12px rgba(30,27,46,0.07)',
        'card-hover': '0 12px 40px rgba(30,27,46,0.14)',
        'rose': '0 4px 20px rgba(212,80,159,0.28)',
        'gold': '0 4px 20px rgba(202,138,4,0.3)',
        'gold-lg': '0 8px 32px rgba(202,138,4,0.4)',
        'masc-card': '0 2px 16px rgba(0,0,0,0.4)',
        'masc-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: []
};
