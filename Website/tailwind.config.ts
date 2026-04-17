import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ["Outfit", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"],
      },
      colors: {
        // Core label palette
        ink: {
          950: "#07070a",
          900: "#0b0b12",
          800: "#10101a",
          700: "#1a1a27",
          600: "#2a2a3a",
        },
        sand: {
          50: "#fff9f0",
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
        violet: { 500: "#7c3aed" },

        // IRhay brand tokens
        irhay: {
          primary: "#D4844C",
          secondary: "#5C3D2E",
          accent: "#8D9A6A",
        },

        // Zvheer brand tokens
        zvheer: {
          primary: "#00FFFF",
          secondary: "#3C4F68",
          accent: "#5B1A28",
          dark: "#0A0A0A",
          ash: "#B1B1B1",
        },
      },
      animation: {
        "ticker": "ticker 20s linear infinite",
        "fade-up": "fadeUp 0.7s ease forwards",
        "fade-up-delay": "fadeUp 0.7s ease 0.15s forwards",
        "fade-up-delay-2": "fadeUp 0.7s ease 0.3s forwards",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.33%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
