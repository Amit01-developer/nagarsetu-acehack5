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
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // BHIM UPI inspired dark theme colors
        dark: {
          bg: '#0A1929',
          surface: '#132F4C',
          card: '#1A3A52',
          border: '#2D4A63',
          text: {
            primary: '#E3F2FD',
            secondary: '#B0BEC5',
            muted: '#78909C',
          },
          accent: {
            blue: '#2196F3',
            green: '#4CAF50',
            orange: '#FF9800',
            red: '#F44336',
          }
        },
      },
    },
  },
  plugins: [],
}
