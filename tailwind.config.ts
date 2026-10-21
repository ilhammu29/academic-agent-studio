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
        matte: {
          bg: "#121214",
          surface: "#1A1A1E",
          surface2: "#222228",
          surface3: "#2A2A32",
          border: "#2C2C34",
          borderLight: "#3A3A44",
        },
        milk: {
          white: "#F5F5F7",
          soft: "#D7D7DC",
          muted: "#9696A0",
          dim: "#646470",
        },
        champagne: {
          DEFAULT: "#D4B996",
          light: "#EAD7BF",
          dark: "#A68A64",
        },
        academic: {
          blue: "#78A0D2",
          red: "#EF5A5A",
          green: "#059669",
        }
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        serif: ["Georgia", "'Times New Roman'", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
