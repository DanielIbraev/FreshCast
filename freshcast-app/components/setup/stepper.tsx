"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["Find your restaurant", "Details", "How busy are you?", "What do you prep?", "Review"];

// Steps already reached are clickable; later ones unlock as you go.
export function Stepper({ current, reached, onJump }: { current: number; reached: number; onJump: (i: number) => void }) {
  return (
    <nav aria-label="Setup progress">
      <p className="mb-2 text-xs text-text-muted sm:hidden">
        Step {current + 1} of {STEPS.length}: <span className="text-text-primary">{STEPS[current]}</span>
      </p>
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {STEPS.map((name, i) => {
          const done = i < current;
          const active = i === current;
          const can = i <= reached && !active;
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => can && onJump(i)}
                disabled={!can}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${name}${done ? " (done)" : ""}`}
                className={cn(
                  "group w-full text-left focus-visible:outline-none",
                  can ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span className={cn("block h-1 rounded-full transition-colors duration-200", active ? "bg-good" : done || i <= reached ? "bg-good/40" : "bg-border")} />
                <span className="mt-2 hidden items-center gap-2 sm:flex">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-600 tabular-nums transition-colors duration-150",
                      active ? "bg-good text-canvas" : done ? "bg-good/15 text-good" : "bg-canvas text-text-muted",
                      "group-focus-visible:ring-1 group-focus-visible:ring-good"
                    )}
                  >
                    {done ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
                  </span>
                  <span className={cn("truncate text-xs", active ? "font-600 text-text-primary" : can ? "text-text-secondary group-hover:text-text-primary" : "text-text-muted")}>{name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
