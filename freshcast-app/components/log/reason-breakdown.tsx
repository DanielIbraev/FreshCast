"use client";

import { motion } from "framer-motion";
import { WasteLog, WasteReason, Ingredient } from "@/lib/types";
import { WASTE_REASONS } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

// Why food was thrown out today, by dollar value.
export function ReasonBreakdown({ logs, ingredients, labels }: { logs: WasteLog[]; ingredients: Ingredient[]; labels?: Record<WasteReason, string> }) {
  const cost = (l: WasteLog) => (ingredients.find((i) => i.id === l.ingredientId)?.costPerKg ?? 0) * l.quantityKg;
  const rows = (Object.keys(WASTE_REASONS) as WasteReason[]).map((r) => ({
    reason: r,
    value: logs.filter((l) => l.reason === r).reduce((s, l) => s + cost(l), 0),
  }));
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-canvas">
        {rows.map((r) =>
          r.value > 0 ? (
            <motion.div
              key={r.reason}
              initial={false}
              animate={{ width: `${(r.value / Math.max(total, 0.01)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ background: WASTE_REASONS[r.reason].color }}
            />
          ) : null
        )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
        {rows.map((r) => (
          <li key={r.reason} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-text-secondary">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: WASTE_REASONS[r.reason].color }} />
              {labels?.[r.reason] ?? WASTE_REASONS[r.reason].label}
            </span>
            <span className="tabular-nums text-text-primary">{formatCurrency(r.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
