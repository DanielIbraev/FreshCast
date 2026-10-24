"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Ingredient } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

interface Props {
  items: Ingredient[];
  onEdit: (i: Ingredient) => void;
  onDelete: (i: Ingredient) => void;
  daysOf: (id: string) => number; // days of stored close-outs for this item
}

export function IngredientTable({ items, onEdit, onDelete, daysOf }: Props) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">No ingredients match. Try another filter or add one.</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="whitespace-nowrap border-b border-border bg-canvas text-left text-[11px] uppercase tracking-wider text-text-muted">
            <th className="px-4 py-2.5 font-500">Ingredient</th>
            <th className="px-4 py-2.5 text-right font-500">Cost / kg</th>
            <th className="px-4 py-2.5 text-right font-500">Daily prep</th>
            <th className="px-4 py-2.5 text-right font-500">Prep value</th>
            <th className="px-4 py-2.5 font-500">Shelf life</th>
            <th className="px-4 py-2.5 font-500">Model</th>
            <th className="w-20 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const perishable = i.shelfLifeDays <= 2;
            return (
              <tr key={i.id} className="group border-b border-border last:border-0 hover:bg-surface-hover/50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[i.category].color }} />
                    <span className="whitespace-nowrap font-500 text-text-primary">{i.name}</span>
                    <span className="hidden whitespace-nowrap text-xs text-text-muted 2xl:inline">{CATEGORIES[i.category].label}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">${i.costPerKg.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">{i.baselinePrepKg}kg</td>
                <td className="px-4 py-3 text-right font-500 tabular-nums text-text-primary">{formatCurrency(i.costPerKg * i.baselinePrepKg)}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-canvas">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${Math.min(i.shelfLifeDays / 7, 1) * 100}%`, background: perishable ? "#EF4444" : i.shelfLifeDays <= 4 ? "#F59E0B" : "#10B981" }}
                      />
                    </span>
                    <span className={`text-xs tabular-nums ${perishable ? "text-waste" : "text-text-secondary"}`}>{i.shelfLifeDays}d</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  {daysOf(i.id) >= 14 ? (
                    <span className="whitespace-nowrap text-xs text-good">Calibrated · {daysOf(i.id)}d</span>
                  ) : daysOf(i.id) > 0 ? (
                    <span className="whitespace-nowrap text-xs text-caution">Calibrating · {daysOf(i.id)}d</span>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-data">New · using baseline</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                    <button onClick={() => onEdit(i)} aria-label={`Edit ${i.name}`} className="rounded p-1.5 text-text-muted hover:bg-canvas hover:text-text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(i)} aria-label={`Delete ${i.name}`} className="rounded p-1.5 text-text-muted hover:bg-canvas hover:text-waste">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
