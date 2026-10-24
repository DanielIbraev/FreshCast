"use client";

import { Plus } from "lucide-react";
import { CUISINE_LABELS } from "@/lib/staples";
import { cn, formatCurrency } from "@/lib/utils";
import { Draft, Errors, PrepRow, customRow, dailyPrepCost } from "./draft";
import { PrepRowView, ROW_GRID } from "./prep-row";

export function StepPrep({ d, errors, setRows }: { d: Draft; errors: Errors; setRows: (rows: PrepRow[]) => void }) {
  const total = dailyPrepCost(d.rows);
  const on = d.rows.filter((r) => r.on).length;
  const patch = (key: string, p: Partial<PrepRow>) => setRows(d.rows.map((r) => (r.key === key ? { ...r, ...p } : r)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-prose text-sm text-text-secondary">
          Common for {CUISINE_LABELS[d.cuisineType].toLowerCase()} kitchens, with typical wholesale prices. Adjust the amounts to what you actually prep on a normal day and untick anything you don&apos;t use.
        </p>
        <div className="text-right" aria-live="polite">
          <p className="text-xs text-text-muted">You prep about</p>
          <p className="font-display text-[28px] font-700 leading-none tabular-nums text-text-primary">{formatCurrency(total)}</p>
          <p className="mt-1 text-xs text-text-muted">of food a day, {on} items</p>
        </div>
      </div>

      <div>
        <div className={cn(ROW_GRID, "hidden border-b border-border pb-2 text-xs text-text-muted sm:grid")} aria-hidden>
          <span />
          <span>Item</span>
          <span className="text-right">Prep / day</span>
          <span className="text-right">Price</span>
          <span className="text-right">Keeps for</span>
          <span className="text-right">Per day</span>
        </div>
        <ul>
          {d.rows.map((r) => (
            <PrepRowView key={r.key} r={r} errors={errors} onChange={(p) => patch(r.key, p)} onRemove={() => setRows(d.rows.filter((x) => x.key !== r.key))} />
          ))}
        </ul>
      </div>

      {errors.rows && (
        <p role="alert" className="text-xs text-waste">
          {errors.rows}
        </p>
      )}

      <button
        type="button"
        onClick={() => setRows([...d.rows, customRow()])}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-good px-3 py-1.5 text-sm text-good transition-colors duration-150 hover:bg-good/10"
      >
        <Plus className="h-4 w-4" aria-hidden /> Add an item
      </button>
    </div>
  );
}
