// Turns stored close-outs into the numbers the dashboard shows. Every figure
// here comes from daily_observations, not from constants.

import { DailyObservation } from "./db";
import { Ingredient } from "./types";
import { localISO } from "./demo-data";

export interface DayTotal {
  date: string;
  wasteCost: number; // what actually went in the bin ($)
  savedCost: number; // what the plan kept out of the bin ($), only on nights it's provable
  savedCo2: number;
  savedKg: number;
  onPlan: boolean;
}

export function dailyTotals(obs: DailyObservation[], ingredients: Ingredient[]): DayTotal[] {
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const days = new Map<string, DayTotal>();
  for (const o of obs) {
    const ing = byId.get(o.ingredientId);
    if (!ing) continue;
    const d = days.get(o.date) ?? { date: o.date, wasteCost: 0, savedCost: 0, savedCo2: 0, savedKg: 0, onPlan: false };
    d.wasteCost += o.loggedKg * ing.costPerKg;
    // Savings = food the plan didn't prep that would otherwise have been
    // binned. If the item sold out (logged 0 after a cut), we can't tell how
    // much of the cut was really waste, so that night counts as $0 saved.
    const provable = o.cutKg > 0 && o.loggedKg > 0 ? o.cutKg : 0;
    d.savedCost += provable * ing.costPerKg;
    d.savedCo2 += provable * ing.co2PerKg;
    d.savedKg += provable;
    d.onPlan ||= o.cutKg > 0;
    days.set(o.date, d);
  }
  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export interface Summary {
  savedLast30: number;
  co2Last30: number;
  kgLast30: number; // food not bought, prepped, or binned
  monthlyBefore: number | null; // avg waste per open day before the plan x open days per month (not season-adjusted)
  monthlyNow: number | null; // same, last 14 open days on the plan
  planStart: string | null;
  daysLogged: number;
}

// openPerWeek: days the restaurant opens each week, to turn per-day into per-month.
export function summarize(totals: DayTotal[], openPerWeek = 7): Summary {
  const perMonth = (openPerWeek * 365) / 7 / 12;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const since = localISO(cutoff);
  const last30 = totals.filter((t) => t.date >= since);
  const before = totals.filter((t) => !t.onPlan);
  const recent = totals.filter((t) => t.onPlan).slice(-14);
  const avg = (xs: DayTotal[]) => xs.reduce((s, t) => s + t.wasteCost, 0) / xs.length;
  return {
    savedLast30: last30.reduce((s, t) => s + t.savedCost, 0),
    co2Last30: last30.reduce((s, t) => s + t.savedCo2, 0),
    kgLast30: last30.reduce((s, t) => s + t.savedKg, 0),
    monthlyBefore: before.length >= 5 ? avg(before) * perMonth : null,
    monthlyNow: recent.length >= 5 ? avg(recent) * perMonth : null,
    planStart: totals.find((t) => t.onPlan)?.date ?? null,
    daysLogged: totals.length,
  };
}
