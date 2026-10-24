"use client";

import { RotateCcw } from "lucide-react";
import { GuestPattern } from "@/components/guest-pattern";
import { cn } from "@/lib/utils";
import { DAY_SHORT, Draft, Errors, SERVICE_LABELS, guestsByDay } from "./draft";
import { Field, errorCls, inputCls } from "./fields";

export function StepBusy({ d, errors, update }: { d: Draft; errors: Errors; update: (patch: Partial<Draft>) => void }) {
  const week = guestsByDay(d);
  const max = Math.max(...week, 1);
  const weekly = week.reduce((s, x) => s + x, 0);

  return (
    <div className="space-y-6">
      <p className="max-w-prose text-sm text-text-secondary">
        Guest count is the biggest signal in the forecast: twice the guests, roughly twice the prep. A rough number is fine. FreshCast corrects it from your close-outs.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
        <Field label="Guests on a typical open day" htmlFor="b-avg" error={errors.avg} hint={d.imported ? "From your sales export." : undefined}>
          <input
            id="b-avg"
            className={cn(inputCls, "font-display text-2xl font-700 tabular-nums", errors.avg && errorCls)}
            type="number"
            inputMode="numeric"
            min={5}
            max={5000}
            value={d.avg}
            onChange={(e) => update({ avg: e.target.value, imported: null })}
          />
        </Field>

        <div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs text-text-secondary">Your week, as the forecast will see it</span>
            <span className="text-[11px] tabular-nums text-text-muted">
              {weekly.toLocaleString("en-US")} guests a week · {d.imported ? "your sales export" : `typical ${SERVICE_LABELS[d.service].toLowerCase()} pattern`}
            </span>
          </div>
          <ul className="grid grid-cols-7 gap-1.5" aria-label="Expected guests by weekday">
            {week.map((c, i) => {
              const closed = !d.openDays[i];
              return (
                <li
                  key={DAY_SHORT[i]}
                  className={cn("flex h-28 flex-col justify-between rounded-md border p-1.5 text-center", closed ? "border-dashed border-border" : "border-border bg-canvas")}
                >
                  <span className="text-[11px] text-text-muted">{DAY_SHORT[i]}</span>
                  {closed ? (
                    <span className="text-[11px] text-text-muted">Closed</span>
                  ) : (
                    <span className="flex flex-1 flex-col justify-end gap-1">
                      <span className="mx-auto w-full max-w-[28px] rounded-sm bg-data/70 transition-[height] duration-300 motion-reduce:transition-none" style={{ height: `${Math.max(4, (c / max) * 48)}px` }} />
                      <span className="text-xs font-600 tabular-nums text-text-primary">{c}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-600 text-text-primary">Have a POS sales export? Use your real week.</h3>
          {d.imported && (
            <button type="button" onClick={() => update({ imported: null })} className="flex cursor-pointer items-center gap-1.5 text-xs text-text-muted transition-colors duration-150 hover:text-text-primary">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Use the typical pattern instead
            </button>
          )}
        </div>
        <div className="max-w-xl">
          <GuestPattern
            coversByDay={week}
            source={d.imported ? "pos-import" : "default"}
            onImport={(r) => update({ imported: r.coversByDay, avg: String(r.avgCovers) })}
          />
        </div>
      </div>
    </div>
  );
}
