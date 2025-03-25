/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
          contrastText: '#fff',
        },
        secondary: {
          main: '#dc004e',
          light: '#ff4081',
          dark: '#c51162',
          contrastText: '#fff',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      },
    },
  },
  plugins: [],
  // Désactiver lors de l'utilisation avec MUI
  corePlugins: {
    preflight: false,
  },
  important: '#root', // Donne priorité à TailwindCSS sur MUI si nécessaire
} 