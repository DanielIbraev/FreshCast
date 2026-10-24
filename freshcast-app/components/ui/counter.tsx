"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

// Animated number that counts up to its target. Respects reduced motion.
export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  durationMs = 800,
  className,
}: CounterProps) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }

    const start = prev.current;
    const delta = value - start;
    const startTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + delta * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prev.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return (
    <span className={className}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
