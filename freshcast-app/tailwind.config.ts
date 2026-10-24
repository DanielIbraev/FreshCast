import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FreshCast design tokens
        canvas: "#0F1117",
        surface: "#1A1D27",
        "surface-hover": "#222634",
        border: "#2D3748",
        "text-primary": "#E2E8F0",
        "text-secondary": "#94A3B8",
        "text-muted": "#8291A7", // 5.2:1 on surface (Hallmark contrast floor)
        // emerald = good/savings, red = waste, amber = medium risk
        good: "#10B981",
        "good-dim": "#0E9668",
        waste: "#EF4444",
        "waste-dim": "#B91C1C",
        caution: "#F59E0B",
        data: "#60A5FA",
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
