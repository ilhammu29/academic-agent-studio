import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "var(--bg-app)",
          nav: "var(--bg-nav)",
          surface: "var(--surface-primary)",
          surface2: "var(--surface-secondary)",
          surface3: "var(--surface-elevated)",
          border: "var(--border-subtle)",
          text: "var(--text-primary)",
          muted: "var(--text-secondary)",
          accent: "var(--accent-primary)",
          accent2: "var(--accent-secondary)",
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
        },
        oxid: {
          bg: "#080B12",
          nav: "#0B101A",
          surface: "#111827",
          surface2: "#172033",
          surface3: "#1C263A",
          border: "#253149",
          text: "#F3F6FC",
          muted: "#A4B1C7",
          blue: "#7C9CFF",
          purple: "#9B8CFF",
          emerald: "#34D399",
          amber: "#FBBF24",
          rose: "#FB7185",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
        elevated: "0 12px 32px -4px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
