import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["DM Sans",   "ui-sans-serif", "system-ui"],
        display: ["Fraunces",  "Georgia", "serif"],
        label:   ["Syne",      "ui-sans-serif"],
      },
      colors: {
        ink: {
          950: "#07070a",
          900: "#0b0b12",
          800: "#10101a",
          700: "#1a1a27",
        },
        sand: {
          50:  "#fff9f0",
          100: "#fff0d6",
          200: "#ffe2ad",
          300: "#ffd07a",
        },
        ember: {
          400: "#ff6a3d",
          500: "#ff4d2d",
          600: "#f33a22",
        },
        jade: {
          400: "#2fe6b8",
          500: "#16d9a7",
        },
        violet: {
          500: "#7c3aed",
        },
      },
    },
  },
  plugins: [],
};

export default config;
