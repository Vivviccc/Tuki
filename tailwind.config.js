/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          rose: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
          purple: '#7c3aed',
          sky: '#0284c7',
        },
        status: {
          saved: '#f43f5e', // Rose/Pink
          interested: '#8b5cf6', // Purple
          visited: '#10b981', // Emerald
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -3px rgba(124, 58, 237, 0.35)',
        'glow-rose': '0 0 25px -3px rgba(244, 63, 94, 0.35)',
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
