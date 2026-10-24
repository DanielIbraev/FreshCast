"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface EffortRow {
  id: string;
  name: string;
  accuracy: number;
  minutes: number;
}

// Staff minutes per day vs. forecast accuracy, one row per logging plan.
export function EffortChart({ rows, recommended, ceiling }: { rows: EffortRow[]; recommended: string; ceiling: number }) {
  const floor = 0.6;
  const w = (v: number) => `${((v - floor) / (1 - floor)) * 100}%`;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-[minmax(0,240px)_70px_1fr_60px] gap-4 px-1 text-[11px] text-text-muted">
        <span>Staff does</span>
        <span className="text-right">Min/day</span>
        <span>Accuracy</span>
        <span />
      </div>
      {rows.map((r, i) => {
        const rec = r.id === recommended;
        return (
          <div key={r.id} className={cn("grid grid-cols-[minmax(0,240px)_70px_1fr_60px] items-center gap-4 rounded-md px-1 py-1.5", rec && "bg-surface-hover")}>
            <span className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
              <span className="truncate">{r.name}</span>
              {rec && <span className="shrink-0 rounded border border-good/50 px-1.5 text-[11px] text-good">default</span>}
            </span>
            <span className="text-right text-sm tabular-nums text-text-secondary">{r.minutes < 0.05 ? "0" : r.minutes.toFixed(1)}</span>
            <div className="relative h-5 rounded bg-canvas">
              <motion.div
                className="h-full rounded"
                initial={{ width: 0 }}
                animate={{ width: w(r.accuracy) }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                style={{ background: rec ? "#10B981" : "#3B4A61" }}
              />
              <div className="absolute inset-y-[-4px] border-l border-dashed border-data/60" style={{ left: w(ceiling) }} />
            </div>
            <span className={cn("text-right text-sm font-600 tabular-nums", rec ? "text-good" : "text-text-primary")}>{(r.accuracy * 100).toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}
