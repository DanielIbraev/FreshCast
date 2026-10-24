"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LEAF = "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z";
const STEM = "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12";

// The FreshCast mark. `animating` loops: the leaf draws itself while a thin
// ring orbits it, a nod to the forecast running.
export function Mark({ size = 32, animating = false, className }: { size?: number; animating?: boolean; className?: string }) {
  const icon = size * 0.58;
  const loop = { duration: 1.4, ease: [0.65, 0, 0.35, 1] as const, repeat: Infinity, repeatType: "loop" as const };

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      {animating && (
        <motion.svg
          className="absolute"
          style={{ inset: -size * 0.22, width: size * 1.44, height: size * 1.44 }}
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
          aria-hidden
        >
          <circle cx="50" cy="50" r="46" fill="none" stroke="#2D3748" strokeWidth="2" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="60 229" />
        </motion.svg>
      )}
      <div className="flex h-full w-full items-center justify-center rounded-[22%] bg-good">
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="#0F1117" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {animating ? (
            <>
              <motion.path d={LEAF} initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0.35] }} transition={loop} />
              <motion.path d={STEM} initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0.35] }} transition={{ ...loop, delay: 0.15 }} />
            </>
          ) : (
            <>
              <path d={LEAF} />
              <path d={STEM} />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
