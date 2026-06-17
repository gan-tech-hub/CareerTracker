import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#d9dee7",
        surface: "#f7f8fb",
        ink: "#18202f",
        muted: "#5d6678",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(18, 24, 38, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
