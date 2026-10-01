/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        spider: {
          black: "#09090D",
          charcoal: "#15151D",
          panel: "#111118",
          surface: "#1A1A24",
          red: "#E62429",
          bright: "#FF3B45",
          darkred: "#2E1216",
          border: "#28171B",
          text: "#F5F5F7",
          muted: "#A1A1AA",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
        display: ["Space Grotesk", "Outfit", "sans-serif"],
      },
      boxShadow: {
        "spider-glow": "0 0 20px rgba(230, 36, 41, 0.35)",
        "spider-glow-lg": "0 0 35px rgba(230, 36, 41, 0.55)",
        "spider-glow-sm": "0 0 10px rgba(230, 36, 41, 0.25)",
      },
    },
  },
  plugins: [],
};
