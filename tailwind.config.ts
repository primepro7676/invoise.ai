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
          50: "#eefdf6",
          100: "#d6faea",
          200: "#aef3d6",
          300: "#76e6ba",
          400: "#3fd09b",
          500: "#18b382",
          600: "#0e8f68",
          700: "#0c7255",
          800: "#0d5b46",
          900: "#0b4a3a",
          950: "#052a21",
        },
        navy: {
          600: "#0b2b3c",
          700: "#08202d",
          800: "#061a24",
          900: "#04121a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(11, 74, 58, 0.08), 0 1px 2px -1px rgba(11, 74, 58, 0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
