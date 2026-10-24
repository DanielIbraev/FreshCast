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
    <>
    {/* Phones: one stacked row per ingredient, edit and delete always visible. */}
    <ul className="divide-y divide-border rounded-md border border-border sm:hidden">
      {items.map((i) => (
        <li key={i.id} className="flex items-center gap-3 py-2.5 pl-4 pr-2">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORIES[i.category].color }} />
              <span className="truncate text-sm font-600 text-text-primary">{i.name}</span>
              <span className="ml-auto shrink-0 text-sm font-600 tabular-nums text-text-primary">{formatCurrency(i.costPerKg * i.baselinePrepKg)}</span>
            </p>
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 pl-[18px] text-xs tabular-nums text-text-muted">
              <span>${i.costPerKg.toFixed(2)}/kg</span>
              <span>{i.baselinePrepKg}kg a day</span>
              <span className={i.shelfLifeDays <= 2 ? "text-waste" : undefined}>keeps {i.shelfLifeDays}d</span>
              <ModelStatus days={daysOf(i.id)} />
            </p>
          </div>
          <span className="flex shrink-0">
            <RowActions i={i} onEdit={onEdit} onDelete={onDelete} />
          </span>
        </li>
      ))}
    </ul>
    <div className="hidden overflow-x-auto rounded-md border border-border sm:block">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="whitespace-nowrap border-b border-border bg-canvas text-left text-xs text-text-muted">
            <th className="px-4 py-2.5 font-600">Ingredient</th>
            <th className="px-4 py-2.5 text-right font-600">Cost / kg</th>
            <th className="px-4 py-2.5 text-right font-600">Daily prep</th>
            <th className="px-4 py-2.5 text-right font-600">Prep value</th>
            <th className="px-4 py-2.5 font-600">Shelf life</th>
            <th className="px-4 py-2.5 font-600">Model</th>
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
                    <span className="whitespace-nowrap font-600 text-text-primary">{i.name}</span>
                    <span className="hidden whitespace-nowrap text-xs text-text-muted 2xl:inline">{CATEGORIES[i.category].label}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">${i.costPerKg.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">{i.baselinePrepKg}kg</td>
                <td className="px-4 py-3 text-right font-600 tabular-nums text-text-primary">{formatCurrency(i.costPerKg * i.baselinePrepKg)}</td>
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
                  <ModelStatus days={daysOf(i.id)} />
                </td>
                <td className="px-4 py-3">
                  <span className="flex justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                    <RowActions i={i} onEdit={onEdit} onDelete={onDelete} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}

function ModelStatus({ days }: { days: number }) {
  if (days >= 14) return <span className="whitespace-nowrap text-xs text-good">Calibrated, {days} nights</span>;
  if (days > 0) return <span className="whitespace-nowrap text-xs text-caution">Calibrating, {days} nights</span>;
  return <span className="whitespace-nowrap text-xs text-data">New, using baseline</span>;
}

function RowActions({ i, onEdit, onDelete }: { i: Ingredient; onEdit: Props["onEdit"]; onDelete: Props["onDelete"] }) {
  return (
    <>
      <button onClick={() => onEdit(i)} aria-label={`Edit ${i.name}`} className="rounded-md p-2 text-text-muted transition-colors duration-150 hover:bg-canvas hover:text-text-primary">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={() => onDelete(i)} aria-label={`Delete ${i.name}`} className="rounded-md p-2 text-text-muted transition-colors duration-150 hover:bg-canvas hover:text-waste">
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );
}
