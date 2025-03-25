/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E50914", // Rouge Netflix
        secondary: "#7B21E8", // Violet pour les accents
        accent: {
          green: "#3ECF8E", // Pour les boutons verts/succès
          blue: "#2173E8", // Pour les accents bleus
          purple: "#8121E8", // Pour les accents violets
          pink: "#E821B4", // Pour les accents roses
          yellow: "#E8B221", // Pour les accents jaunes
        },
        dark: {
          DEFAULT: "#151515", // Fond principal
          light: "#222222", // Fond secondaire
          card: "#1E1E1E", // Fond des cartes
        },
        light: "#F5F5F1", // Texte clair
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "anime-pattern": "url('/anime-pattern.png')",
      },
      borderRadius: {
        card: "0.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      boxShadow: {
        'card': '0 4px 10px 0 rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 20px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}; 