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
        bw: {
          bg: "#000000",
          card: "#09090B",
          surface: "#121214",
          surface2: "#18181B",
          surface3: "#27272A",
          border: "#27272A",
          borderLight: "#3F3F46",
          borderStrong: "#52525B",
          text: "#FFFFFF",
          muted: "#A1A1AA",
          dim: "#71717A",
          hover: "#27272A",
        },
        matte: {
          bg: "#000000",
          surface: "#09090B",
          surface2: "#121214",
          surface3: "#18181B",
          border: "#27272A",
          borderLight: "#3F3F46",
        },
        milk: {
          white: "#FFFFFF",
          soft: "#FAFAFA",
          muted: "#A1A1AA",
          dim: "#71717A",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
