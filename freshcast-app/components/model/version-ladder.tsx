"use client";

import { motion } from "framer-motion";
import { VersionResult } from "@/lib/backtest";

// Each model version adds signals; bars show forecast accuracy on the same
// 12 simulated weeks. The dashed line is the oracle, which knows the simulator's hidden habits.
export function VersionLadder({ versions, ceiling }: { versions: VersionResult[]; ceiling: number }) {
  const floor = 0.5; // axis starts at 50% so differences are readable
  const pct = (v: number) => `${((v - floor) / (1 - floor)) * 100}%`;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 border-l border-dashed border-data/60" style={{ left: `calc(220px + (100% - 220px - 64px) * ${(ceiling - floor) / (1 - floor)})` }}>
        <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-xs text-data">Oracle {(ceiling * 100).toFixed(0)}%</span>
      </div>
      <ul className="space-y-3 pt-4">
        {versions.map((v, i) => {
          const last = i === versions.length - 1;
          return (
            <li key={v.id} className="grid grid-cols-[220px_1fr_64px] items-center">
              <div className="pr-4">
                <p className="text-sm text-text-primary">
                  <span className="mr-2 font-mono text-xs text-text-muted">{v.id}</span>
                  {v.name}
                </p>
                <p className="truncate text-xs text-text-muted">{v.detail}</p>
              </div>
              <div className="h-7 overflow-hidden rounded bg-canvas">
                <motion.div
                  className="h-full rounded"
                  initial={{ width: 0 }}
                  animate={{ width: pct(v.accuracy) }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.12 }}
                  style={{ background: last ? "#10B981" : i === 0 ? "#EF4444" : "#3B4A61" }}
                />
              </div>
              <span className={`text-right font-display text-lg font-700 tabular-nums ${last ? "text-good" : "text-text-primary"}`}>
                {(v.accuracy * 100).toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
