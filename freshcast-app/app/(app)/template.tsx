"use client";

import { useNavTransition } from "@/components/nav-transition";
import { useStore } from "@/lib/store";

// Re-mounts on every tab change and every restaurant switch. The page's
// sections fade up one after another (CSS `.fc-page` in globals.css), but only
// once the kitchen's data and weather are in: until then the centre logo is
// shown and the page is held invisible at its first frame, so nothing pops in
// or jumps around while numbers arrive.
export default function Template({ children }: { children: React.ReactNode }) {
  const { pending, loading } = useNavTransition();
  const { profile } = useStore();
  return (
    <div key={profile.id} className={pending || loading ? "fc-page fc-hold" : "fc-page"}>
      {children}
    </div>
  );
}
