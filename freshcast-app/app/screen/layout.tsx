import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "Kitchen screen · FreshCast" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0F1117" };

export default function ScreenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
