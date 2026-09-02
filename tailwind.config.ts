import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgba(255, 255, 255, 0.04)",
          100: "rgba(255, 255, 255, 0.10)",
          200: "rgba(255, 255, 255, 0.18)",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#34d399",
          800: "#6ee7b7",
          900: "#a7f3d0",
          950: "#052a21",
        },
        navy: {
          50: "#ffffff",
          100: "#f8fafc",
          200: "#f1f5f9",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#94a3b8", // Clean, visible slate-400 for subtitles/descriptions
          700: "#cbd5e1", // Crisp, readable slate-300 for body labels and text
          800: "#f1f5f9", // Bright slate-100 for primary values
          900: "#ffffff", // Pure 100% bright white for all titles & headers
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
