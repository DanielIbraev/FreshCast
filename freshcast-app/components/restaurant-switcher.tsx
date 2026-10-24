"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Croissant, Plus, Salad, Store, UtensilsCrossed } from "lucide-react";
import { useStore } from "@/lib/store";
import { Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Store> = {
  "marcos-trattoria": UtensilsCrossed,
  "golden-crumb": Croissant,
  "kendall-bowls": Salad,
};
const iconFor = (p: Profile) => ICONS[p.id] ?? Store;

// Switch between the three demo kitchens (very different on purpose: dinner
// trattoria, morning bakery, weekday lunch bowls) and any restaurant the
// visitor set up. Each has its own menu, history, weather and model.
export function RestaurantSwitcher({ compact = false }: { compact?: boolean }) {
  const { profile, restaurants, switchRestaurant, hydrated } = useStore();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const Icon = iconFor(profile);
  const demos = restaurants.filter((r) => r.isDemo);
  const own = restaurants.filter((r) => !r.isDemo);

  return (
    <div ref={root} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md border border-border bg-canvas text-left transition-colors duration-150 hover:border-text-muted",
          compact ? "px-2 py-1.5" : "px-3 py-2.5"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-hover">
          <Icon className="h-4 w-4 text-good" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-600 text-text-primary">{profile.name}</span>
          <span className="block truncate text-[11px] text-text-muted">
            {hydrated ? `${profile.cuisineLabel ?? profile.place} · ${profile.seats} seats` : "Loading kitchen"}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Switch restaurant"
          className={cn(
            "absolute z-40 w-[300px] rounded-lg border border-border bg-surface p-1.5",
            compact ? "right-0 top-full mt-2" : "bottom-full left-0 mb-2"
          )}
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] text-text-muted">Demo kitchens · fictional, simulated history</p>
          {demos.map((r) => (
            <Row key={r.id} r={r} active={r.id === profile.id} onPick={() => (switchRestaurant(r.id), setOpen(false))} />
          ))}
          {own.length > 0 && <p className="mt-1 border-t border-border px-2.5 pb-1 pt-2 text-[11px] text-text-muted">Your restaurants · saved on this device</p>}
          {own.map((r) => (
            <Row key={r.id} r={r} active={r.id === profile.id} onPick={() => (switchRestaurant(r.id), setOpen(false))} />
          ))}
          <Link
            href="/setup"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2.5 rounded-md border-t border-border px-2.5 py-2.5 text-sm text-good transition-colors duration-150 hover:bg-surface-hover"
          >
            <Plus className="h-4 w-4" /> Set up a new restaurant
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ r, active, onPick }: { r: Profile; active: boolean; onPick: () => void }) {
  const Icon = iconFor(r);
  return (
    <button
      role="menuitemradio"
      aria-checked={active}
      onClick={onPick}
      className={cn("flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-150 hover:bg-surface-hover", active && "bg-surface-hover")}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-good" : "text-text-muted")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-500 text-text-primary">{r.name}</span>
        <span className="block text-[11px] leading-snug text-text-muted">{r.tagline ?? `${r.place} · ${r.seats} seats`}</span>
      </span>
      {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-good" />}
    </button>
  );
}
