"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { parseLocalDate } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

export default function OrdersPage() {
  const { selected } = useStore();
  const [copied, setCopied] = useState(false);
  if (!selected) return <div className="h-96 animate-pulse rounded-card bg-surface" />;

  const day = parseLocalDate(selected.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const rows = selected.ingredients.map((p) => ({
    p,
    usual: p.ingredient.baselinePrepKg,
    rec: p.recommendedPrepKg,
    saved: (p.ingredient.baselinePrepKg - p.recommendedPrepKg) * p.ingredient.costPerKg,
  }));
  const usualSpend = rows.reduce((s, r) => s + r.usual * r.p.ingredient.costPerKg, 0);
  const recSpend = rows.reduce((s, r) => s + r.rec * r.p.ingredient.costPerKg, 0);
  const cutKg = rows.reduce((s, r) => s + (r.usual - r.rec), 0);

  function copyList() {
    const text = [`Prep list for ${day} (${selected!.expectedCovers} covers)`, ...rows.map((r) => `${r.p.ingredient.name}: ${r.rec.toFixed(1)}kg`)].join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-text-muted">
            {day} · {selected.expectedCovers} covers · {selected.weather.description}
          </p>
          <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Prep & order list</h1>
        </div>
        <button onClick={copyList} className="flex items-center gap-2 rounded-md border border-good px-4 py-2 text-sm font-600 text-good transition-colors duration-150 hover:bg-good hover:text-canvas">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied for your supplier" : "Copy list for supplier"}
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardLabel>Spend if you prep as usual</CardLabel>
          <p className="mt-2 font-display text-[40px] font-800 leading-none tabular-nums text-text-secondary line-through decoration-2">{formatCurrency(usualSpend)}</p>
        </Card>
        <Card>
          <CardLabel>Spend on FreshCast plan</CardLabel>
          <p className="mt-2 font-display text-[40px] font-800 leading-none tabular-nums text-good">{formatCurrency(recSpend)}</p>
          <p className="mt-2 text-xs text-text-muted">{formatCurrency(usualSpend - recSpend)} less, {cutKg.toFixed(1)}kg less food bought</p>
        </Card>
        <Card>
          <CardLabel>CO₂ kept out of the bin</CardLabel>
          <p className="mt-2 font-display text-[40px] font-800 leading-none tabular-nums text-good">{selected.totalCo2Prevented.toFixed(1)}kg</p>
          <p className="mt-2 text-xs text-text-muted">for this one service</p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 grid grid-cols-[220px_1fr_90px_90px_220px] gap-4 px-2 text-[11px] uppercase tracking-wider text-text-muted">
          <span>Ingredient</span>
          <span>Usual vs. recommended</span>
          <span className="text-right">Prep</span>
          <span className="text-right">Saved</span>
          <span>Main reason</span>
        </div>
        <ul className="divide-y divide-border">
          {rows.map(({ p, usual, rec, saved }) => (
            <li key={p.ingredient.id} className="grid grid-cols-[220px_1fr_90px_90px_220px] items-center gap-4 px-2 py-3">
              <span className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[p.ingredient.category].color }} />
                <span className="truncate text-sm font-500 text-text-primary">{p.ingredient.name}</span>
              </span>
              <div className="relative h-2.5 rounded-full bg-canvas">
                <div className="absolute inset-y-0 left-0 rounded-full bg-border" style={{ width: "100%" }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-good" style={{ width: `${(rec / usual) * 100}%` }} />
              </div>
              <span className="text-right text-sm tabular-nums">
                <span className="text-text-muted line-through">{usual}</span> <span className="font-600 text-good">{rec.toFixed(1)}kg</span>
              </span>
              <span className="text-right text-sm font-600 tabular-nums text-good">{formatCurrency(saved)}</span>
              <span className="truncate text-xs text-text-secondary">
                {p.primaryDriver.label}: {p.primaryDriver.detail}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
