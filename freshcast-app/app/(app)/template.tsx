"use client";

import { useNavTransition } from "@/components/nav-transition";

// Re-mounts on every tab change. The page's sections fade up one after another
// (CSS `.fc-page` in globals.css). While the nav overlay is still up the
// animation is held at its first frame, so it plays as the overlay fades out.
export default function Template({ children }: { children: React.ReactNode }) {
  const { pending } = useNavTransition();
  return <div className={pending ? "fc-page fc-hold" : "fc-page"}>{children}</div>;
}
