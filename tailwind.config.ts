import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1760px",
      },
      maxWidth: {
        "site": "1440px",
        "site-xl": "1680px",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "sans-serif"],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        "industrial-yellow": "#F4C400",
        "metallic-gold": "#D9A441",
        "deep-black": "#0B0B0B",
        graphite: "#1A1A1A",
        steel: "#5C5C5C",
        "white-smoke": "#F5F5F5",
      },
      keyframes: {
        glow: {
          from: { boxShadow: "0 0 5px rgba(244, 196, 0, 0.2)" },
          to: { boxShadow: "0 0 20px rgba(244, 196, 0, 0.6)" },
        },
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
