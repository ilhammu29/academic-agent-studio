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
          bg: "#07090E",
          surface: "#0D111A",
          surface2: "#141A26",
          surface3: "#1C2436",
          border: "#1E2738",
          borderLight: "#2B374D",
        },
        milk: {
          white: "#F8FAFC",
          soft: "#E2E8F0",
          muted: "#94A3B8",
          dim: "#64748B",
        },
        champagne: {
          DEFAULT: "#D4B996",
          light: "#EAD7BF",
          dark: "#A68A64",
        },
        electric: {
          cyan: "#00A3FF",
          cyanHover: "#008BD9",
          cyanGlow: "rgba(0, 163, 255, 0.25)",
        },
        academic: {
          blue: "#38BDF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          purple: "#A855F7",
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        serif: ["'Merriweather'", "Georgia", "'Times New Roman'", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
};
export default config;
