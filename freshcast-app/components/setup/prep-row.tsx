"use client";

import { Check, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { Category } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Errors, PrepRow as Row, positive } from "./draft";

const CATS = CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORIES[c].label }));
const cell = "w-full rounded-md border border-[#66768C] bg-canvas px-2 py-1.5 text-right text-sm tabular-nums text-text-primary transition-colors duration-150 focus:border-good focus:outline-none disabled:opacity-40";

// Shared column template so the header in step-prep lines up with rows.
export const ROW_GRID = "grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 gap-y-2 sm:grid-cols-[28px_minmax(0,1fr)_84px_84px_72px_76px] sm:items-center";

function Num({ id, label, value, unit, onChange, bad, disabled }: { id: string; label: string; value: string; unit: string; onChange: (v: string) => void; bad?: boolean; disabled?: boolean }) {
  return (
    <label htmlFor={id} className="flex items-center gap-1.5 sm:block">
      <span className="w-20 text-xs text-text-muted sm:sr-only">{label}</span>
      <span className="relative block flex-1">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={value}
          disabled={disabled}
          aria-invalid={bad || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(cell, "pr-7", bad && "border-waste focus:border-waste")}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">{unit}</span>
      </span>
    </label>
  );
}

export function PrepRowView({ r, errors, onChange, onRemove }: { r: Row; errors: Errors; onChange: (patch: Partial<Row>) => void; onRemove: () => void }) {
  const daily = positive(r.prep) && positive(r.cost) ? Number(r.prep) * Number(r.cost) : 0;
  const bad = (f: string) => !!errors[`${r.key}.${f}`];
  const off = !r.on;

  return (
    <li className={cn(ROW_GRID, "border-b border-border py-3 last:border-0", off && "opacity-60")}>
      {r.custom ? (
        <button type="button" onClick={onRemove} aria-label={`Remove ${r.name || "new item"}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:bg-waste/10 hover:text-waste">
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          role="checkbox"
          aria-checked={r.on}
          aria-label={`Include ${r.name}`}
          onClick={() => onChange({ on: !r.on })}
          className={cn("flex h-5 w-5 cursor-pointer items-center justify-center self-center rounded border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-good", r.on ? "border-good bg-good" : "border-border hover:border-text-muted")}
        >
          {r.on && <Check className="h-3.5 w-3.5 text-canvas" aria-hidden />}
        </button>
      )}

      {r.custom ? (
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input
            aria-label="Item name"
            value={r.name}
            maxLength={60}
            placeholder="Item name, e.g. Short Rib"
            onChange={(e) => onChange({ name: e.target.value })}
            className={cn("min-w-0 flex-1 rounded-md border border-[#66768C] bg-canvas px-2 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-good focus:outline-none", bad("name") && "border-waste")}
          />
          <Select<Category> label="Category" value={r.category} options={CATS} onChange={(c) => onChange({ category: c })} className="sm:w-36" />
        </div>
      ) : (
        <span className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORIES[r.category].color }} aria-hidden />
          <span className={cn("truncate", off && "line-through decoration-text-muted")}>{r.name}</span>
          <span className="hidden text-xs text-text-muted md:inline">{CATEGORIES[r.category].label}</span>
        </span>
      )}

      <div className="col-start-2 grid grid-cols-1 gap-2 sm:contents">
        <Num id={`${r.key}-prep`} label="Prep a day" unit="kg" value={r.prep} bad={bad("prep")} disabled={off} onChange={(v) => onChange({ prep: v })} />
        <Num id={`${r.key}-cost`} label="Price" unit="$/kg" value={r.cost} bad={bad("cost")} disabled={off} onChange={(v) => onChange({ cost: v })} />
        <Num id={`${r.key}-shelf`} label="Keeps for" unit="d" value={r.shelf} bad={bad("shelf")} disabled={off} onChange={(v) => onChange({ shelf: v })} />
        <span className="text-right text-xs tabular-nums text-text-secondary">
          <span className="mr-1 text-text-muted sm:hidden">Per day</span>
          {off ? "–" : formatCurrency(daily)}
        </span>
      </div>
    </li>
  );
}
