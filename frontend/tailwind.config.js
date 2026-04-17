/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF' },
        covered: '#22C55E',
        expiring: '#EAB308',
        action: '#EF4444'
      },
      minHeight: { touch: '48px' },
      minWidth: { touch: '48px' }
    }
  },
  plugins: []
};
