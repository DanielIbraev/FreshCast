"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { importPosCsv, PosImport } from "@/lib/pos-import";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Guests-by-weekday bars, plus "upload your sales export" to learn them.
export function GuestPattern({ coversByDay, source, onImport }: { coversByDay: number[]; source: "default" | "pos-import"; onImport: (r: PosImport) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PosImport | null>(null);
  const max = Math.max(...coversByDay, 1);

  function handle(text: string) {
    try {
      const r = importPosCsv(text);
      setResult(r);
      setError(null);
      onImport(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 5_000_000) return setError("That file is over 5 MB. Export a shorter date range.");
    handle(await f.text());
  }

  async function sample() {
    const res = await fetch("/sample-square-export.csv");
    handle(await res.text());
  }

  return (
    <div>
      <div className="flex h-28 items-end gap-2">
        {coversByDay.map((c, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs tabular-nums text-text-secondary">{c}</span>
            <div className="w-full rounded-t bg-data/70 transition-all duration-500" style={{ height: `${(c / max) * 72}px` }} />
            <span className="text-xs text-text-muted">{DAYS[i]}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-muted">
        {result
          ? `Learned from ${result.days} days of sales (${result.firstDate} to ${result.lastDate})${result.guestColumn ? `, "${result.guestColumn}" column` : ", one guest per ticket"}. File stayed on this device.`
          : source === "pos-import"
            ? "From your sales export."
            : "Typical weekly pattern. Upload a POS sales export to use your real numbers."}
      </p>
      {error && <p className="mt-2 text-xs text-waste">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex items-center gap-2 rounded-md border border-border bg-canvas px-3 py-1.5 text-xs text-text-primary transition-colors duration-150 hover:border-good"
        >
          <Upload className="h-3.5 w-3.5" /> Upload POS sales export (CSV)
        </button>
        <button
          type="button"
          onClick={sample}
          className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-text-muted transition-colors duration-150 hover:text-text-primary")}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> Try a sample export
        </button>
        <input ref={input} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Sales export CSV" />
      </div>
    </div>
  );
}
