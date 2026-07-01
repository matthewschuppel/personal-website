import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201c",
        moss: "#416858",
        clay: "#bd6848",
        paper: "#fbfaf6",
        mist: "#e7eee9",
        cobalt: "#345c8c",
        amber: "#d49a3d"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 32, 28, 0.12)",
        crisp: "0 1px 0 rgba(23, 32, 28, 0.08), 0 14px 40px rgba(23, 32, 28, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
