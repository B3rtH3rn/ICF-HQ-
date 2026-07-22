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
          300: "#f7c78a",
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
        lilac: {
          100: "#efeafc",
          200: "#ddd2f7",
          300: "#c4b1ef",
          400: "#a98ee4",
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
        lift: "0 18px 40px -12px rgba(41, 92, 80, 0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        float: "float 9s ease-in-out infinite",
        "float-slow": "float 13s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
