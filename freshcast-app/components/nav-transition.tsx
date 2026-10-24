"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mark } from "@/components/brand/mark";

// Shows the looping logo between tabs. Held for at least MIN_MS so a fast
// navigation reads as a deliberate transition instead of a flicker.
const MIN_MS = 450;

const NavContext = createContext<{ pending: boolean; start: (href: string) => void }>({ pending: false, start: () => {} });
export const useNavTransition = () => useContext(NavContext);

export function NavTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const startedAt = useRef(0);
  const target = useRef<string | null>(null);

  const start = useCallback(
    (href: string) => {
      if (href === pathname) return;
      target.current = href;
      startedAt.current = performance.now();
      setPending(true);
    },
    [pathname]
  );

  useEffect(() => {
    if (!pending || pathname !== target.current) return;
    const wait = Math.max(0, MIN_MS - (performance.now() - startedAt.current));
    const t = setTimeout(() => setPending(false), wait);
    return () => clearTimeout(t);
  }, [pathname, pending]);

  return <NavContext.Provider value={{ pending, start }}>{children}</NavContext.Provider>;
}

export function NavOverlay() {
  const { pending } = useNavTransition();
  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center bg-canvas/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="status"
          aria-label="Loading"
        >
          <Mark size={52} animating />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
