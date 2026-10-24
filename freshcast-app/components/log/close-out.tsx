"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, Minus, MoonStar, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Strings, t } from "@/lib/i18n";

// End of service: today's logs plus tonight's guest count become one
// observation per ingredient. The model refits and tomorrow's forecast moves.
export function CloseOut({ s = t("en") }: { s?: Strings }) {
  const { closeOutToday, week, dbStatus, today } = useStore();
  const [guests, setGuests] = useState<number | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [saved, setSaved] = useState(0);
  const [busy, setBusy] = useState(false);
  const tomorrow = week[0];

  // Prefill from reservations; a POS integration would fill the real number.
  useEffect(() => {
    if (today && guests === null) setGuests(today.expectedCovers);
  }, [today, guests]);

  async function run() {
    if (!tomorrow || guests === null) return;
    setBusy(true);
    setBefore(tomorrow.totalWasteCost);
    setSaved(await closeOutToday(guests));
    setBusy(false);
  }

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
          <div className="flex items-center rounded-md border border-border bg-canvas">
            <button onClick={() => step(-1)} aria-label="One fewer guest" className="px-2 py-2 text-text-muted hover:text-text-primary">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              aria-label="Guests served tonight"
              value={guests ?? ""}
              onChange={(e) => setGuests(Math.max(0, Math.min(400, Number(e.target.value) || 0)))}
              className="w-12 bg-transparent text-center text-sm font-600 tabular-nums text-text-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => step(1)} aria-label="One more guest" className="px-2 py-2 text-text-muted hover:text-text-primary">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {today && <span className="text-[11px] text-text-muted">{s.booked(today.expectedCovers)}</span>}
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
          <span className="tabular-nums text-text-muted line-through">{formatCurrency(before)}</span>
          <span className="font-600 tabular-nums text-text-primary">{formatCurrency(tomorrow.totalWasteCost)}</span>
        </motion.p>
      )}
    </Card>
  );
}
