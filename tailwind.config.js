/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mumbai: {
          dark: '#0A0D1B',
          night: '#12162B',
          surface: 'rgba(22, 27, 51, 0.75)',
          surfaceSolid: '#161B33',
          border: 'rgba(56, 189, 248, 0.2)',
          borderHover: 'rgba(56, 189, 248, 0.4)',
          marigold: '#F59E0B',
          saffron: '#EA580C',
          chai: '#E06D10',
          chaiLight: '#FBBF24',
          cyanGlow: '#06B6D4',
          mintGlow: '#10B981',
          lotus: '#EC4899',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
