import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FreshCast design tokens are declared in app/globals.css.
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-hover": "rgb(var(--color-surface-hover) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        // Emerald = good/savings, red = waste, amber = medium risk.
        good: "rgb(var(--color-good) / <alpha-value>)",
        "good-dim": "rgb(var(--color-good-dim) / <alpha-value>)",
        waste: "rgb(var(--color-waste) / <alpha-value>)",
        "waste-dim": "rgb(var(--color-waste-dim) / <alpha-value>)",
        caution: "rgb(var(--color-caution) / <alpha-value>)",
        data: "rgb(var(--color-data) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      fontWeight: {
        "400": "400",
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800",
      },
      borderRadius: {
        card: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
