"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, MoonStar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

// End of service: today's logs become one observation per ingredient. The
// model refits on them, and tomorrow's forecast changes on screen.
export function CloseOut() {
  const { closeOutToday, week, dbStatus, today } = useStore();
  const [before, setBefore] = useState<number | null>(null);
  const [saved, setSaved] = useState(0);
  const [busy, setBusy] = useState(false);
  const tomorrow = week[0];

  async function run() {
    if (!tomorrow) return;
    setBusy(true);
    setBefore(tomorrow.totalWasteCost);
    setSaved(await closeOutToday());
    setBusy(false);
  }

  return (
    <Card className="flex items-center gap-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-canvas">
        <MoonStar className="h-5 w-5 text-data" />
      </div>
      <div className="flex-1">
        <h2 className="font-display text-base font-600 text-text-primary">Close out tonight</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Saves today&apos;s totals{dbStatus === "connected" ? " to Supabase" : ""} and refits the model. Tomorrow&apos;s forecast updates from what you actually threw out.
        </p>
        {before !== null && tomorrow && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-2 text-sm">
            <Database className="h-3.5 w-3.5 text-good" />
            <span className="text-text-secondary">{saved} close-outs saved. Tomorrow&apos;s forecast:</span>
            <span className="tabular-nums text-text-muted line-through">{formatCurrency(before)}</span>
            <span className="font-600 tabular-nums text-text-primary">{formatCurrency(tomorrow.totalWasteCost)}</span>
          </motion.p>
        )}
      </div>
      <button
        onClick={run}
        disabled={busy || !today}
        className="shrink-0 rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim disabled:opacity-50"
      >
        {busy ? "Saving" : before !== null ? "Close out again" : "Close out today"}
      </button>
    </Card>
  );
}
