/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        "bg-primary":  "#090e1a",
        "bg-surface":  "#0e1525",
        "bg-elevated": "#131d30",
        "bg-hover":    "#1a2540",

        // Borders
        "border-dim":   "#1a2540",
        "border-light": "#243050",
        "border-focus": "#2d7ef7",

        // Brand
        "accent": "#2d7ef7",

        // Market
        "profit":  "#00e5a0",
        "loss":    "#ff4d6d",
        "neutral": "#ffd166",
        "premium": "#a78bfa",

        // Text
        "text-primary":   "#e2e8f0",
        "text-secondary": "#94a3b8",
        "text-muted":     "#64748b",
        "text-disabled":  "#374151",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "blue":   "0 0 24px rgba(45,126,247,0.15)",
        "profit": "0 0 16px rgba(0,229,160,0.15)",
        "loss":   "0 0 16px rgba(255,77,109,0.15)",
        "card":   "0 4px 24px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      animation: {
        "pulse-slow": "pulse 2s infinite",
        "shimmer":    "skeleton-shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};