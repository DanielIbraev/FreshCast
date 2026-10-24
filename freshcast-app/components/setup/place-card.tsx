"use client";

import { ChevronRight, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { CUISINE_LABELS } from "@/lib/staples";
import { DAY_SHORT, PlaceResult, SERVICE_LABELS } from "./draft";

const AMENITY: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  fast_food: "Counter service",
  bar: "Bar",
  pub: "Pub",
  food_court: "Food court",
  ice_cream: "Ice cream",
  bakery: "Bakery",
};

// [true x7] → "Every day"; one day off → "Closed Mon"; else "Tue, Thu, Sat".
export function daysSummary(open: boolean[]): string {
  const n = open.filter(Boolean).length;
  if (n === 7) return "Every day";
  if (n === 6) return `Closed ${DAY_SHORT[open.indexOf(false)]}`;
  if (n === 5 && !open[0] && !open[6]) return "Mon to Fri";
  return DAY_SHORT.filter((_, i) => open[i]).join(", ");
}

function hoursSummary(p: PlaceResult): string {
  if (!p.openingHours) return "Hours not listed";
  if (!p.service) return p.openingHours.slice(0, 48);
  return `${daysSummary(p.openDays)} · ${SERVICE_LABELS[p.service].toLowerCase()}`;
}

export function PlaceCard({ p, onPick }: { p: PlaceResult; onPick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className="group flex w-full cursor-pointer items-center gap-4 rounded-lg border border-border bg-canvas p-4 text-left transition-colors duration-150 hover:border-good hover:bg-surface-hover focus-visible:border-good focus-visible:outline-none"
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 font-display text-[15px] font-600 text-text-primary">
            {p.name}
            <span className="font-sans text-[11px] font-400 text-text-muted">{AMENITY[p.osmType] ?? "Restaurant"}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden /> {p.address}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-3 w-3" aria-hidden /> {CUISINE_LABELS[p.cuisineType]}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" aria-hidden /> {hoursSummary(p)}
            </span>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1 text-xs font-600 text-good sm:flex">
          Use this <ChevronRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-text-muted sm:hidden" aria-hidden />
      </button>
    </li>
  );
}

export function PlaceSkeleton() {
  return (
    <li aria-hidden className="rounded-lg border border-border bg-canvas p-4">
      <div className="h-4 w-40 animate-pulse rounded bg-surface-hover motion-reduce:animate-none" />
      <div className="mt-2.5 h-3 w-64 max-w-full animate-pulse rounded bg-surface-hover motion-reduce:animate-none" />
      <div className="mt-3 flex gap-4">
        <div className="h-3 w-20 animate-pulse rounded bg-surface-hover motion-reduce:animate-none" />
        <div className="h-3 w-28 animate-pulse rounded bg-surface-hover motion-reduce:animate-none" />
      </div>
    </li>
  );
}
