import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        warmth: {
          50: "#fff8f0",
          100: "#fef0e0",
          200: "#fbdcb8",
        },
        calm: {
          50: "#f0f9f6",
          100: "#dcefe7",
          200: "#b7dfd0",
          300: "#8ecdb6",
          400: "#5fb597",
          500: "#3f8f79",
          600: "#317263",
          700: "#295c50",
        },
        sun: {
          400: "#f2a154",
          500: "#e88a35",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(41, 92, 80, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
