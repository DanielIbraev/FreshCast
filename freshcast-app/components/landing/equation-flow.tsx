"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type Term = {
  op: string;
  title: string;
  body: string;
  result?: boolean;
};

export function EquationFlow({ terms }: { terms: Term[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { amount: 0.35, once: true });
  const reduceMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => setMotionReady(true), []);

  return (
    <ol ref={listRef} className="mt-10 grid overflow-hidden rounded-lg border border-border md:grid-cols-4">
      {terms.map((term, index) => {
        const active = !motionReady || reduceMotion || inView;
        return (
          <motion.li
            key={term.title}
            initial={false}
            animate={{ opacity: active ? 1 : 0.38, x: active ? 0 : -10 }}
            transition={
              inView && !reduceMotion
                ? { duration: 0.32, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0 }
            }
            className={`min-w-0 p-6 ${index > 0 ? "border-t border-border md:border-l md:border-t-0" : ""} ${term.result ? "bg-surface" : ""}`}
          >
            <p className="flex h-8 items-center gap-2 font-display text-xl font-700 text-text-primary">
              {term.op && (
                <span className="text-2xl font-400 text-text-muted" aria-hidden>
                  {term.op}
                </span>
              )}
              <span className={term.result ? "text-waste" : undefined}>{term.title}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{term.body}</p>
          </motion.li>
        );
      })}
    </ol>
  );
}
