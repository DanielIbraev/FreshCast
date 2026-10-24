"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mark } from "@/components/brand/mark";
import { useStore } from "@/lib/store";

// Shows the looping logo between tabs. Held for at least MIN_MS so a fast
// navigation reads as a deliberate transition instead of a flicker, then
// fades out over EXIT_S while the new page's sections fade up underneath.
const MIN_MS = 300;
const ENTER_S = 0.16;
const EXIT_S = 0.2;

// Never hold the page longer than this waiting for data (slow network).
const MAX_LOAD_MS = 3500;

const NavContext = createContext<{ pending: boolean; loading: boolean; start: (href: string) => void }>({ pending: false, loading: false, start: () => {} });
export const useNavTransition = () => useContext(NavContext);

export function NavTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const startedAt = useRef(0);
  const target = useRef<string | null>(null);
  const { ready } = useStore();
  const [gaveUp, setGaveUp] = useState(false);
  const [settled, setSettled] = useState(false);

  // First load and restaurant switches: hold until data + weather are in,
  // then wait one more frame so charts have measured before anything shows.
  useEffect(() => {
    if (!ready) {
      setSettled(false);
      setGaveUp(false);
      const t = setTimeout(() => setGaveUp(true), MAX_LOAD_MS);
      return () => clearTimeout(t);
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)));
    return () => cancelAnimationFrame(raf);
  }, [ready]);
  const loading = !(ready && settled) && !gaveUp;

  const start = useCallback(
    (href: string) => {
      if (href === pathname) return;
      target.current = href;
      startedAt.current = performance.now();
      setPending(true);
    },
    [pathname]
  );

  // Never leave the overlay up if a navigation is abandoned.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(false), 3000);
    return () => clearTimeout(t);
  }, [pending]);

  useEffect(() => {
    if (!pending || pathname !== target.current) return;
    const wait = Math.max(0, MIN_MS - (performance.now() - startedAt.current));
    const t = setTimeout(() => setPending(false), wait);
    return () => clearTimeout(t);
  }, [pathname, pending]);

  return <NavContext.Provider value={{ pending, loading, start }}>{children}</NavContext.Provider>;
}

export function NavOverlay() {
  const { pending, loading } = useNavTransition();
  return (
    <AnimatePresence>
      {(pending || loading) && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center bg-canvas print:hidden"
          initial={loading ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: ENTER_S, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: EXIT_S, ease: "easeIn" } }}
          role="status"
          aria-label="Loading"
        >
          <Mark size={52} animating />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
