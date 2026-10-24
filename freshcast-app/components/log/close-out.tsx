"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Database, Minus, MoonStar, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Strings, t } from "@/lib/i18n";
import { localISO, parseLocalDate } from "@/lib/demo-data";
import { DayPrediction } from "@/lib/types";
import { ItemChange, WhatChanged } from "./what-changed";

const LEARNABLE = new Set(["overprep", "spoiled"]);
const cal = (p: DayPrediction["ingredients"][number]) => p.signals.find((x) => x.key === "calibration")?.value ?? 1;

// End of service: today's logs plus tonight's guest count become one
// observation per ingredient. The model refits and tomorrow's forecast moves.
export function CloseOut({ s = t("en") }: { s?: Strings }) {
  const { closeOutToday, week, dbStatus, today, logs } = useStore();
  const snap = useRef<{ tomorrow: DayPrediction; today: DayPrediction; binned: Map<string, number> } | null>(null);
  const [changes, setChanges] = useState<{ items: ItemChange[]; before: number; after: number } | null>(null);
  const [guests, setGuests] = useState<number | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [saved, setSaved] = useState(0);
  const [busy, setBusy] = useState(false);
  const tomorrow = week.find((d) => !d.closed) ?? week[0];

  // Prefill with the usual for today; staff correct it from the register.
  useEffect(() => {
    if (today && guests === null) setGuests(today.expectedCovers);
  }, [today, guests]);

  if (today?.closed) {
    return (
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-canvas">
            <MoonStar className="h-5 w-5 text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">Closed today. Nothing to close out; the forecast skips closed days.</p>
        </div>
      </Card>
    );
  }

  async function run() {
    if (!tomorrow || guests === null) return;
    setBusy(true);
    setBefore(tomorrow.totalWasteCost);
    setChanges(null);
    if (today) {
      const binned = new Map<string, number>();
      for (const l of logs) if (localISO(new Date(l.loggedAt)) === today.date && LEARNABLE.has(l.reason)) binned.set(l.ingredientId, (binned.get(l.ingredientId) ?? 0) + l.quantityKg);
      snap.current = { tomorrow, today, binned };
    }
    setSaved(await closeOutToday(guests));
    setBusy(false);
  }

  // Once the store has refit tomorrow's forecast, compare it with the snapshot.
  useEffect(() => {
    const sn = snap.current;
    if (!sn || !tomorrow || tomorrow === sn.tomorrow) return;
    const after = new Map(tomorrow.ingredients.map((p) => [p.ingredient.id, p]));
    const items: ItemChange[] = sn.tomorrow.ingredients.flatMap((b) => {
      const a = after.get(b.ingredient.id);
      const t0 = sn.today.ingredients.find((p) => p.ingredient.id === b.ingredient.id);
      if (!a || !t0) return [];
      return [{ id: b.ingredient.id, name: b.ingredient.name, forecastKg: t0.predictedWasteKg, actualKg: (sn.binned.get(b.ingredient.id) ?? 0) + t0.cutKg, calBefore: cal(b), calAfter: cal(a), costBefore: b.predictedWasteCost, costAfter: a.predictedWasteCost }];
    });
    setChanges({ items, before: sn.tomorrow.totalWasteCost, after: tomorrow.totalWasteCost });
    snap.current = null;
  }, [tomorrow]);

  const step = (d: number) => setGuests((g) => Math.max(0, Math.min(400, (g ?? 0) + d)));

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-canvas">
          <MoonStar className="h-5 w-5 text-data" />
        </div>
        <div className="min-w-[260px] flex-1">
          <h2 className="font-display text-base font-600 text-text-primary">{s.closeTitle}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">{s.closeSub(dbStatus === "connected")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{s.guests}</span>
          <div className="flex items-center rounded-md border border-[#66768C] bg-canvas">
            <button onClick={() => step(-1)} aria-label="One fewer guest" className="flex h-8 items-center px-2 text-text-muted hover:text-text-primary">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              aria-label="Guests served tonight"
              value={guests ?? ""}
              onChange={(e) => setGuests(Math.max(0, Math.min(400, Number(e.target.value) || 0)))}
              className="w-12 bg-transparent text-center text-sm font-600 tabular-nums text-text-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => step(1)} aria-label="One more guest" className="flex h-8 items-center px-2 text-text-muted hover:text-text-primary">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {today && <span className="text-xs text-text-muted">{s.booked(today.expectedCovers)}</span>}
        </div>
        <button
          onClick={run}
          disabled={busy || !today}
          className="shrink-0 rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim disabled:opacity-50"
        >
          {busy ? s.saving : before !== null ? s.closeAgain : s.closeBtn}
        </button>
      </div>
      {before !== null && tomorrow && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-16 mt-3 flex items-center gap-2 text-sm">
          <Database className="h-3.5 w-3.5 text-good" />
          <span className="text-text-secondary">{s.saved(saved)}</span>
        </motion.p>
      )}
      {changes && tomorrow && (
        <WhatChanged items={changes.items} tomorrowBefore={changes.before} tomorrowAfter={changes.after} dayName={parseLocalDate(tomorrow.date).toLocaleDateString("en-US", { weekday: "long" })} />
      )}
    </Card>
  );
}
