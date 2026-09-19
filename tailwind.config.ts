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
        forest: {
          50: "#eef5f0",
          100: "#d8e8dc",
          200: "#b5d4be",
          300: "#8ab999",
          400: "#5f9b73",
          500: "#3b7e53",
          600: "#29633e",
          700: "#1c4d30",
          800: "#133d26",
          900: "#0c2e1b",
          950: "#092616",
        },
        gold: {
          300: "#fae196",
          400: "#f5cf6d",
          500: "#e5ba55",
          600: "#cfa23e",
          700: "#a87f28",
        },
        canvas: "#f4f7f4",
        sage: {
          50: "#f8faf8",
          100: "#f0f5f1",
          200: "#e2ede5",
          300: "#c5dccb",
          400: "#9cb8a7",
          500: "#6d947b",
          600: "#526b5c",
          700: "#355240",
          800: "#1c3d2b",
          900: "#0c2317",
        },
        navy: {
          50: "#f8faf8",
          100: "#f0f5f1",
          200: "#e2ede5",
          300: "#c5dccb",
          400: "#8fa899",
          500: "#6d8978",
          600: "#526b5c", // Crisp sage-gray for subtitles/descriptions
          700: "#355240", // Readable forest for body labels and text
          800: "#1c3d2b", // Dark forest for primary values
          900: "#0c2317", // High-contrast dark forest charcoal for titles & headers
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(13, 40, 24, 0.04)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
