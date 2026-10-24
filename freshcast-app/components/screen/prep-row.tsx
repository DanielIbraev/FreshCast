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
// Hallmark waiver, 39b (control height): the row button is ~160px tall on
// purpose. A cook with wet or gloved hands taps it from arm's length.
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
          "flex h-full min-h-[96px] w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 rounded-card border px-4 py-3 text-left transition-colors duration-150 sm:flex-nowrap sm:px-5",
          done ? "border-border bg-canvas" : "border-border bg-surface hover:bg-surface-hover"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-11 w-11 shrink-0 lg:h-10 lg:w-10 items-center justify-center rounded-md border-2 transition-colors duration-150",
            done ? "border-good bg-good text-canvas" : "border-text-muted text-transparent"
          )}
        >
          <Check className="h-7 w-7" strokeWidth={3} />
        </span>

        <span className={cn("min-w-0 flex-1 transition-opacity duration-150", done && "opacity-50")}>
          <span
            className={cn(
              "block font-display text-[26px] font-600 leading-tight text-text-primary [overflow-wrap:break-word] lg:text-[25px] xl:text-3xl",
              done && "line-through decoration-2"
            )}
          >
            {item.name}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:mt-1.5 xl:mt-2">
            {changed ? (
              <span className="rounded-full bg-good/15 px-3 py-0.5 text-lg font-600 tabular-nums text-good lg:text-base xl:text-lg">{t.less(item.lessKg)}</span>
            ) : (
              <span className="rounded-full border border-border px-3 py-0.5 text-lg font-500 text-text-secondary lg:text-base xl:text-lg">{t.asUsual}</span>
            )}
            {changed && <span className="text-lg leading-snug text-text-secondary lg:text-base xl:text-lg">{item.reason}</span>}
          </span>
        </span>

        <span className={cn("w-full pl-[60px] transition-opacity duration-150 sm:w-auto sm:shrink-0 sm:pl-0 sm:text-right", done && "opacity-50")}>
          <span className="mb-1 block text-base leading-none text-text-secondary">{done ? t.done : t.prep}</span>
          <span className={cn("block font-display text-5xl font-700 leading-none tabular-nums tracking-tight lg:text-[50px] xl:text-6xl", changed ? "text-good" : "text-text-primary")}>
            {item.prepKg.toFixed(1)}
            <span className="ml-1 text-2xl font-600 text-text-secondary">kg</span>
          </span>
          {changed && (
            <span className="mt-1.5 block text-lg leading-snug tabular-nums text-text-muted lg:text-base xl:text-lg">
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
