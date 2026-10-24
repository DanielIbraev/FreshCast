import type { Metadata } from "next";
// Fonts are bundled from npm so builds never depend on reaching Google Fonts.
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreshCast — Forecast food waste before it happens",
  description: "Waste forecasting for independent restaurants. No hardware, 5-minute setup.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
