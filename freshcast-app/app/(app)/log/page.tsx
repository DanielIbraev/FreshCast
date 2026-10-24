"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Undo2 } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { ReasonBreakdown } from "@/components/log/reason-breakdown";
import { CloseOut } from "@/components/log/close-out";
import { useStore } from "@/lib/store";
import { WasteReason } from "@/lib/types";
import { CATEGORIES, WASTE_REASONS } from "@/lib/categories";
import { cn, formatCurrency } from "@/lib/utils";

const AMOUNTS = [0.1, 0.25, 0.5, 1, 2];

export default function LogWastePage() {
  const { ingredients, logs, addLog, removeLog, hydrated } = useStore();
  const [picked, setPicked] = useState<string | null>(null);
  const [reason, setReason] = useState<WasteReason>("overprep");

  const today = new Date().toDateString();
  const todays = logs.filter((l) => new Date(l.loggedAt).toDateString() === today);
  const find = (id: string) => ingredients.find((i) => i.id === id);
  const totalCost = todays.reduce((s, l) => s + (find(l.ingredientId)?.costPerKg ?? 0) * l.quantityKg, 0);
  const totalCo2 = todays.reduce((s, l) => s + (find(l.ingredientId)?.co2PerKg ?? 0) * l.quantityKg, 0);
  const totalKg = todays.reduce((s, l) => s + l.quantityKg, 0);

  function log(quantityKg: number) {
    if (!picked) return;
    addLog({ id: `${Date.now()}`, ingredientId: picked, quantityKg, reason, loggedAt: new Date().toISOString() });
    setPicked(null);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-text-muted">Tap the item, tap the amount. The reason defaults to over-prepped. This is the only daily input FreshCast needs.</p>
        <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Log waste</h1>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardLabel>Thrown out today</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-waste">
            <Counter value={totalCost} prefix="$" decimals={2} />
          </p>
          <p className="mt-2 text-xs text-text-muted">{totalKg.toFixed(2)}kg across {todays.length} entries</p>
        </Card>
        <Card>
          <CardLabel>CO₂ from today&apos;s waste</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-waste">
            <Counter value={totalCo2} suffix="kg" decimals={1} />
          </p>
          <p className="mt-2 text-xs text-text-muted">about {Math.round(totalCo2 / 0.4)} miles of driving</p>
        </Card>
        <Card>
          <CardLabel>Why it was thrown out</CardLabel>
          <div className="mt-3">
            <ReasonBreakdown logs={todays} ingredients={ingredients} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-600 text-text-primary">
            <span className="mr-2 text-sm font-500 text-text-muted">1</span>What went in the bin?
          </h2>
          <span className="text-xs text-text-muted">Tiles show what&apos;s been logged today</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {ingredients.map((i) => {
            const kgToday = todays.filter((l) => l.ingredientId === i.id).reduce((s, l) => s + l.quantityKg, 0);
            return (
            <button
              key={i.id}
              onClick={() => setPicked(picked === i.id ? null : i.id)}
              className={cn(
                "flex h-[72px] flex-col justify-between rounded-md border px-3 py-2.5 text-left transition-colors duration-150",
                picked === i.id ? "border-good bg-surface-hover" : "border-border bg-canvas hover:border-text-muted"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[i.category].color }} />
                <span className="truncate text-sm font-500 text-text-primary">{i.name}</span>
              </span>
              <span className="flex items-center justify-between text-[11px] tabular-nums">
                <span className="text-text-muted">${i.costPerKg}/kg</span>
                {kgToday > 0 && <span className="font-600 text-waste">{kgToday.toFixed(2)}kg · {formatCurrency(kgToday * i.costPerKg)}</span>}
              </span>
            </button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-sm font-600 text-text-primary">
                  <span className="mr-2 text-sm font-500 text-text-muted">2</span>Why, and how much {find(picked)?.name}?
                </p>
                <div className="mb-3 flex gap-1.5" role="radiogroup" aria-label="Reason">
                  {(Object.keys(WASTE_REASONS) as WasteReason[]).map((r) => (
                    <button
                      key={r}
                      role="radio"
                      aria-checked={reason === r}
                      onClick={() => setReason(r)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
                        reason === r ? "border-text-secondary bg-surface-hover font-600 text-text-primary" : "border-border text-text-muted hover:text-text-secondary"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: WASTE_REASONS[r].color }} />
                      {WASTE_REASONS[r].label}
                    </button>
                  ))}
                </div>
              <div className="flex items-center gap-2">
                {AMOUNTS.map((a) => (
                  <button key={a} onClick={() => log(a)} className="flex-1 rounded-md border border-border bg-canvas py-3 transition-colors duration-150 hover:border-waste">
                    <span className="block font-display text-lg font-700 tabular-nums text-text-primary">{a}kg</span>
                    <span className="block text-[11px] tabular-nums text-text-muted">
                      {formatCurrency((find(picked)?.costPerKg ?? 0) * a)} · {WASTE_REASONS[reason].label.toLowerCase()}
                    </span>
                  </button>
                ))}
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-lg font-600 text-text-primary">Today&apos;s log</h2>
        {hydrated && todays.length === 0 && <p className="py-6 text-center text-sm text-text-muted">Nothing logged yet today.</p>}
        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {todays.map((l) => {
              const ing = find(l.ingredientId);
              return (
                <motion.li key={l.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-3">
                    <span className="w-16 whitespace-nowrap text-xs tabular-nums text-text-muted">{new Date(l.loggedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                    <span className="text-sm text-text-primary">{ing?.name ?? "Removed item"}</span>
                    <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ color: WASTE_REASONS[l.reason].color, background: `${WASTE_REASONS[l.reason].color}1A` }}>
                      {WASTE_REASONS[l.reason].label}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-xs tabular-nums text-text-muted">{l.quantityKg}kg</span>
                    <span className="w-16 text-right text-sm font-600 tabular-nums text-waste">{formatCurrency((ing?.costPerKg ?? 0) * l.quantityKg)}</span>
                    <button onClick={() => removeLog(l.id)} aria-label="Undo entry" className="text-text-muted hover:text-text-primary">
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </Card>

      <CloseOut />
    </div>
  );
}
