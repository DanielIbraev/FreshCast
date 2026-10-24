"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenStrings } from "@/lib/i18n-screen";

export interface PrepItem {
  id: string;
  name: string;
  prepKg: number; // rounded to 0.1, what the cook preps
  usualKg: number; // rounded to 0.1
  lessKg: number; // usual − prep, rounded to 0.1
  reason: string;
}

// One ingredient on the wall screen. The whole row is the tap target: tap to
// mark it prepped, tap again to undo.
export function PrepRow({ item, done, onToggle, t }: { item: PrepItem; done: boolean; onToggle: () => void; t: ScreenStrings }) {
  const changed = item.lessKg > 0;
  return (
    <li className="min-h-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${done ? t.markUndone(item.name) : t.markDone(item.name)}. ${t.prep} ${item.prepKg.toFixed(1)} kg`}
        onClick={onToggle}
        className={cn(
          "flex h-full min-h-[96px] w-full cursor-pointer items-center gap-4 rounded-card border px-4 py-4 text-left transition-colors duration-150 sm:gap-5 sm:px-5",
          done ? "border-border bg-canvas" : "border-border bg-surface hover:bg-surface-hover"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150",
            done ? "border-good bg-good text-canvas" : "border-text-muted text-transparent"
          )}
        >
          <Check className="h-7 w-7" strokeWidth={3} />
        </span>

        <span className={cn("min-w-0 flex-1 transition-opacity duration-150", done && "opacity-50")}>
          <span
            className={cn(
              "block font-display text-[26px] font-600 leading-tight text-text-primary [overflow-wrap:anywhere] sm:text-3xl",
              done && "line-through decoration-2"
            )}
          >
            {item.name}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {changed ? (
              <span className="rounded-full bg-good/15 px-3 py-0.5 text-lg font-600 tabular-nums text-good">{t.less(item.lessKg)}</span>
            ) : (
              <span className="rounded-full border border-border px-3 py-0.5 text-lg font-500 text-text-secondary">{t.asUsual}</span>
            )}
            {changed && <span className="text-lg leading-snug text-text-secondary">{item.reason}</span>}
          </span>
        </span>

        <span className={cn("shrink-0 text-right transition-opacity duration-150", done && "opacity-50")}>
          <span className="block text-base text-text-secondary">{done ? t.done : t.prep}</span>
          <span className={cn("block font-display text-5xl font-700 leading-none tabular-nums tracking-tight sm:text-6xl", changed ? "text-good" : "text-text-primary")}>
            {item.prepKg.toFixed(1)}
            <span className="ml-1 text-2xl font-600 text-text-secondary">kg</span>
          </span>
          {changed && (
            <span className="mt-2 block text-lg tabular-nums text-text-muted">
              {t.usual} <s className="decoration-2">{item.usualKg.toFixed(1)}</s>
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export function PrepRowSkeleton() {
  return (
    <li className="min-h-[96px] animate-pulse rounded-card border border-border bg-surface" aria-hidden>
      <span className="sr-only">…</span>
    </li>
  );
}
