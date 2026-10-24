"use client";

import { motion } from "framer-motion";
import { IngredientPrediction } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  items: IngredientPrediction[];
  applied: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function IngredientBars({ items, applied, selectedId, onSelect }: Props) {
  const max = Math.max(...items.map((i) => i.predictedWasteCost), 1);

  return (
    <ul className="space-y-1.5">
      {items.map((item, idx) => {
        const cost = applied ? item.reducedWasteCost : item.predictedWasteCost;
        const kg = applied ? item.reducedWasteKg : item.predictedWasteKg;
        const isSel = item.ingredient.id === selectedId;
        const learning = item.signals.find((s) => s.key === "calibration")?.detail === "Cold start";
        return (
          <li key={item.ingredient.id}>
            <button
              onClick={() => onSelect(item.ingredient.id)}
              className={cn(
                "grid w-full grid-cols-[120px_1fr_70px] items-center gap-3 sm:grid-cols-[180px_1fr_88px] sm:gap-4 rounded-md px-2 py-1.5 text-left transition-colors duration-150",
                isSel ? "bg-surface-hover" : "hover:bg-surface-hover/60"
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORIES[item.ingredient.category].color }} />
                <span className="truncate text-sm text-text-primary">{item.ingredient.name}</span>
                {learning && (
                  <span className="shrink-0 rounded border border-data/40 px-1 text-[11px] text-data">learning</span>
                )}
              </span>
              <div className="relative h-7 overflow-hidden rounded bg-canvas">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded"
                  initial={false}
                  animate={{
                    width: `${Math.max((cost / max) * 100, 3)}%`,
                    backgroundColor: applied ? "#10B981" : item.riskLevel === "low" ? "#F59E0B" : "#EF4444",
                  }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: idx * 0.05 }}
                />
              </div>
              <span className="text-right leading-tight">
                <span className={cn("block text-sm font-600 tabular-nums", applied ? "text-good" : "text-text-primary")}>
                  {formatCurrency(cost)}
                </span>
                <span className="block text-[11px] tabular-nums text-text-muted" title="80% range, learned from this kitchen's past errors">
                  {!applied && item.lowCost !== undefined && item.highCost !== undefined ? `${formatCurrency(item.lowCost)}–${formatCurrency(item.highCost)}` : `${kg.toFixed(2)}kg`}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
