import Link from "next/link";
import { Croissant, Salad, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { DEMO_PROFILES } from "@/lib/profile";

// One short, true fact per demo kitchen (see lib/profile.ts coversByDay / openDays).
const EXTRA: Record<string, { icon: LucideIcon; fact: string }> = {
  "marcos-trattoria": { icon: UtensilsCrossed, fact: "Busiest Saturday" },
  "golden-crumb": { icon: Croissant, fact: "Bakes daily" },
  "kendall-bowls": { icon: Salad, fact: "Closed Sundays" },
};

export function KitchenPicker() {
  return (
    <div className="mt-9">
      <h2 className="text-sm font-500 text-text-primary">Open a demo kitchen</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {DEMO_PROFILES.map((p) => {
          const { icon: Icon, fact } = EXTRA[p.id] ?? { icon: UtensilsCrossed, fact: "" };
          return (
            <li key={p.id} className="min-w-0">
              <Link
                href={`/dashboard?r=${p.id}`}
                className="group flex h-full flex-row items-center gap-3 rounded-md border border-border bg-surface p-4 transition-colors duration-150 hover:border-good hover:bg-surface-hover sm:flex-col sm:items-start"
              >
                <Icon className="h-5 w-5 shrink-0 text-good" strokeWidth={2} aria-hidden />
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-600 leading-snug text-text-primary">{p.name}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-text-secondary">{p.cuisineLabel}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-text-muted">{fact}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/setup"
        className="mt-5 inline-block rounded-sm text-sm font-500 text-good underline decoration-good/40 underline-offset-4 transition-colors duration-150 hover:decoration-good"
      >
        Set up your own restaurant
      </Link>
    </div>
  );
}
