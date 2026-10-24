"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LEAF = "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z";
const STEM = "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12";

// The FreshCast mark. When `animating`, the leaf redraws itself in a loop:
// stem first, then the leaf outline, a short hold, then it fades and repeats.
export function Mark({ size = 32, animating = false, className }: { size?: number; animating?: boolean; className?: string }) {
  const icon = size * 0.58;
  const t = { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const, times: [0, 0.55, 0.85, 1] };

  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-[22%] bg-good", className)} style={{ width: size, height: size }}>
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-canvas))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {animating ? (
          <>
            <motion.path d={STEM} initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 1], opacity: [1, 1, 1, 0] }} transition={t} />
            <motion.path d={LEAF} initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 1], opacity: [1, 1, 1, 0] }} transition={{ ...t, delay: 0.12 }} />
          </>
        ) : (
          <>
            <path d={LEAF} />
            <path d={STEM} />
          </>
        )}
      </svg>
    </div>
  );
}
