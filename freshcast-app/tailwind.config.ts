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
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        "surface-hover": "var(--color-surface-hover)",
        border: "var(--color-border)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        // Emerald = good/savings, red = waste, amber = medium risk.
        good: "var(--color-good)",
        "good-dim": "var(--color-good-dim)",
        waste: "var(--color-waste)",
        "waste-dim": "var(--color-waste-dim)",
        caution: "var(--color-caution)",
        data: "var(--color-data)",
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
