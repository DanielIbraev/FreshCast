import type { Metadata } from "next";
// Fonts are bundled from npm so builds never depend on reaching Google Fonts.
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreshCast — Forecast food waste before it happens",
  description:
    "FreshCast tells an independent restaurant each morning how much less of each ingredient to prep. No hardware. About a minute a night.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
