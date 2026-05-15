import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1400FF",
          50: "#EBE9FF",
          100: "#D6D3FF",
          200: "#ADA7FF",
          300: "#847AFF",
          400: "#5B4EFF",
          500: "#1400FF",
          600: "#1000CC",
          700: "#0C0099",
          800: "#080066",
          900: "#040033",
        },
        brand: {
          blue: "#1400FF",
          gray: "#9B9B9B",
          bg: "#f8f9fa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
