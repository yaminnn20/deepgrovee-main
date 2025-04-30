import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "ping-short": "ping 2s ease-in-out 5000",
        "pulse-slow": "pulseSlow 2s infinite",
        "wave": "wave 1.2s infinite ease-in-out",
        "fade-in": "fadeIn 0.5s ease-in-out forwards",
        "blob": "blob 7s infinite", // <-- Added blob animation here
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.7)" },
          "50%": { transform: "scaleY(1.2)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        blob: { // <-- Added blob keyframe here
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 30px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      screens: {
        betterhover: { raw: "(hover: hover)" },
      },
      transitionProperty: {
        height: "height",
        width: "width",
      },
      dropShadow: {
        glowBlue: [
          "0px 0px 2px #000",
          "0px 0px 4px #000",
          "0px 0px 30px #0141ff",
          "0px 0px 100px #0141ff80",
        ],
        glowRed: [
          "0px 0px 2px #f00",
          "0px 0px 4px #000",
          "0px 0px 15px #ff000040",
          "0px 0px 30px #f00",
          "0px 0px 100px #ff000080",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        favorit: ["var(--font-favorit)"],
        inter: ["Inter", "Arial", "sans serif"],
      },
    },
  },
  plugins: [nextui()],
};
export default config;
