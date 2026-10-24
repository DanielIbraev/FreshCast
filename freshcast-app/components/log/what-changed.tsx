"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface ItemChange {
  id: string;
  name: string;
  forecastKg: number; // what this morning's forecast expected tonight (if prepped as usual)
  actualKg: number; // binned (over-prep + spoiled) + what the plan didn't prep
  calBefore: number; // kitchen calibration for this item before tonight
  calAfter: number;
  costBefore: number; // tomorrow's forecast waste ($) before tonight's close-out
  costAfter: number;
}

const kg = (n: number) => `${n.toFixed(2)} kg`;

// After a close-out: what the model learned tonight, item by item, in numbers.
// This is the learning loop made visible: log → correction → tomorrow moves.
export function WhatChanged({ items, tomorrowBefore, tomorrowAfter, dayName }: { items: ItemChange[]; tomorrowBefore: number; tomorrowAfter: number; dayName: string }) {
  const reduce = useReducedMotion();
  const top = [...items].sort((a, b) => Math.abs(b.costAfter - b.costBefore) - Math.abs(a.costAfter - a.costBefore)).slice(0, 4);
  const moved = top.filter((i) => Math.abs(i.calAfter - i.calBefore) >= 0.005);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5 border-t border-border pt-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-600 text-text-primary">What tonight taught the model</h3>
        <p className="flex items-center gap-2 text-sm tabular-nums text-text-secondary">
          {dayName}&apos;s forecast
          <span className="text-text-muted line-through">{formatCurrency(tomorrowBefore)}</span>
          <ArrowRight className="h-3.5 w-3.5 text-text-muted" aria-hidden />
          <span className="font-600 text-text-primary">{formatCurrency(tomorrowAfter)}</span>
        </p>
      </div>
      {moved.length === 0 ? (
        <p className="mt-2 text-sm text-text-secondary">Tonight matched the forecast closely, so the corrections barely moved.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {moved.map((i) => {
            const up = i.actualKg > i.forecastKg;
            const Icon = up ? TrendingUp : TrendingDown;
            return (
              <li key={i.id} className="rounded-md border border-border bg-canvas px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-600 text-text-primary">
                  <Icon className={`h-4 w-4 ${up ? "text-waste" : "text-good"}`} aria-hidden />
                  {i.name}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  Tonight {kg(i.actualKg)} against {kg(i.forecastKg)} forecast, so its correction went from{" "}
                  <span className="tabular-nums text-text-primary">×{i.calBefore.toFixed(2)}</span> to{" "}
                  <span className="tabular-nums text-text-primary">×{i.calAfter.toFixed(2)}</span>.
                </p>
                <p className="mt-1 text-[13px] tabular-nums text-text-muted">
                  {dayName}: {formatCurrency(i.costBefore)} → <span className={up ? "text-waste" : "text-good"}>{formatCurrency(i.costAfter)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-text-muted">
        One night moves a correction only a little: each one is an average over the last 4 weeks, pulled toward 1.0, so a single odd night can&apos;t swing the plan.
      </p>
    </motion.div>
  );
}
