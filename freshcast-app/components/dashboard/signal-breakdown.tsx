"use client";

import { motion } from "framer-motion";
import { IngredientPrediction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

// Shows the model's work for one ingredient: every signal, its source, and
// how far it moves the forecast from neutral (x1.00).
export function SignalBreakdown({ item }: { item: IngredientPrediction }) {
  const maxSwing = 0.45; // bar scale: x0.55 .. x1.45 fills the half-track

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-base font-600 text-text-primary">{item.ingredient.name}</h3>
        <span className="text-xs text-text-muted">9 signals, multiplied</span>
      </div>

      <ul className="space-y-2">
        {item.signals.map((s, i) => {
          const delta = s.value - 1;
          const pct = Math.min(Math.abs(delta) / maxSwing, 1) * 50;
          const up = delta > 0.001;
          const down = delta < -0.001;
          return (
            <li key={s.key} className="grid grid-cols-[1fr_96px_52px] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-text-primary">{s.label}</p>
                {/* the detail, then where it came from, each on its own line */}
                <p className="text-xs leading-snug text-text-secondary">{s.detail}</p>
                <p className="text-xs leading-snug text-text-muted">{s.source}</p>
              </div>
              {/* centered track: left = less waste, right = more waste */}
              <div className="relative h-1.5 rounded-full bg-canvas">
                <div className="absolute inset-y-[-3px] left-1/2 w-px bg-border" />
                <motion.div
                  className="absolute inset-y-0 rounded-full"
                  initial={false}
                  animate={{
                    left: up ? "50%" : `${50 - pct}%`,
                    width: `${pct}%`,
                    backgroundColor: up ? "#EF4444" : "#10B981",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.03 }}
                />
              </div>
              <span className={`text-right text-xs font-600 tabular-nums ${up ? "text-waste" : down ? "text-good" : "text-text-muted"}`}>
                ×{s.value.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* The actual equation, so judges can see this is arithmetic, not a chatbot */}
      <div className="mt-4 rounded-md border border-border bg-canvas px-3 py-2.5 font-mono text-xs leading-relaxed text-text-secondary">
        <span className="text-text-primary">{item.baseWasteKg.toFixed(2)}kg</span> base
        {item.signals.map((s) => (
          <span key={s.key}> × {s.value.toFixed(2)}</span>
        ))}
        <span> = </span>
        <span className="font-600 text-waste">{item.predictedWasteKg.toFixed(2)}kg</span>
        <span> × ${item.ingredient.costPerKg}/kg = </span>
        <span className="font-600 text-waste">{formatCurrency(item.predictedWasteCost)}</span>
      </div>

      {item.lowKg !== undefined && item.highKg !== undefined && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-canvas px-3 py-2 text-xs">
          <span className="text-text-secondary">
            80% range: <span className="font-600 tabular-nums text-text-primary">{item.lowKg.toFixed(2)}–{item.highKg.toFixed(2)}kg</span> ({formatCurrency(item.lowCost ?? 0)}–{formatCurrency(item.highCost ?? 0)})
          </span>
          <span className="text-text-muted">
            {item.rangeSource === "own" ? `from ${item.rangeN} of this item's nights` : item.rangeSource === "blended" ? `${item.rangeN} nights + kitchen average` : "cold start, still wide"}
          </span>
        </div>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{item.recommendation}</p>
    </div>
  );
}
