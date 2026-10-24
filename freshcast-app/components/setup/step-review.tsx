"use client";

import { Hand, Languages, Moon, Scale, Users } from "lucide-react";
import { CUISINE_LABELS } from "@/lib/staples";
import { averageOpen } from "@/lib/profile";
import { formatCurrency } from "@/lib/utils";
import { Draft, SERVICE_LABELS, dailyPrepCost, guestsByDay } from "./draft";
import { daysSummary } from "./place-card";

function Row({ label, value, onEdit }: { label: string; value: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-border py-2.5 last:border-0">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="min-w-0 text-sm text-text-primary">{value}</dd>
      <button type="button" onClick={onEdit} className="cursor-pointer text-xs text-text-muted transition-colors duration-150 hover:text-good" aria-label={`Edit ${label.toLowerCase()}`}>
        Edit
      </button>
    </div>
  );
}

const ROUTINE = [
  { icon: Hand, text: "Tap each item that went in the bin, then pick a portion: a handful, a bowl, half a pan, a full pan." },
  { icon: Users, text: "Confirm how many guests you served." },
  { icon: Scale, text: "No scale and no typing. FreshCast turns portions into kilos, dollars and CO₂." },
  { icon: Languages, text: "Staff can do it in English or Spanish." },
];

export function StepReview({ d, goTo }: { d: Draft; goTo: (step: number) => void }) {
  const week = guestsByDay(d);
  const on = d.rows.filter((r) => r.on);
  const custom = on.filter((r) => r.custom).length;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <dl>
        <Row label="Restaurant" value={<span className="font-600">{d.name}</span>} onEdit={() => goTo(1)} />
        <Row label="Address" value={<>{d.address}<span className="block text-[11px] text-text-muted">Weather for {d.loc?.place || "your location"}</span></>} onEdit={() => goTo(1)} />
        <Row label="Cuisine" value={d.cuisineLabel.trim() ? `${CUISINE_LABELS[d.cuisineType]} · ${d.cuisineLabel.trim()}` : CUISINE_LABELS[d.cuisineType]} onEdit={() => goTo(1)} />
        <Row label="Service" value={`${SERVICE_LABELS[d.service]} · ${daysSummary(d.openDays)} · ${d.seats} seats`} onEdit={() => goTo(1)} />
        <Row
          label="Guests"
          value={
            <>
              About {averageOpen(week, d.openDays)} on an open day
              <span className="block text-[11px] text-text-muted">{d.imported ? "From your sales export" : "Typical weekly pattern, corrected as you log"}</span>
            </>
          }
          onEdit={() => goTo(2)}
        />
        <Row
          label="Prep list"
          value={
            <>
              {on.length} items, about {formatCurrency(dailyPrepCost(d.rows))} a day
              {custom > 0 && <span className="block text-[11px] text-text-muted">Includes {custom} you added</span>}
            </>
          }
          onEdit={() => goTo(3)}
        />
      </dl>

      <section aria-labelledby="routine-h" className="rounded-lg border border-good/40 bg-canvas p-5">
        <h3 id="routine-h" className="flex items-center gap-2 font-display text-base font-600 text-text-primary">
          <Moon className="h-4 w-4 text-good" aria-hidden /> Your nightly routine
        </h3>
        <p className="mt-1 text-xs text-text-secondary">This is the only daily work. About a minute at close.</p>
        <ol className="mt-4 space-y-3">
          {ROUTINE.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-sm text-text-secondary">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
              {text}
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-border pt-3 text-[11px] text-text-muted">Tomorrow&apos;s prep list updates the moment you close out.</p>
      </section>
    </div>
  );
}
