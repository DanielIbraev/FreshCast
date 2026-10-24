// Turns stored close-outs into the numbers the dashboard shows. Every figure
// here comes from daily_observations, not from constants.

import { DailyObservation } from "./db";
import { Ingredient } from "./types";
import { localISO } from "./demo-data";

export interface DayTotal {
  date: string;
  wasteCost: number; // what actually went in the bin ($)
  savedCost: number; // what the plan kept out of the bin ($)
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
    d.savedCost += o.cutKg * ing.costPerKg;
    d.savedCo2 += o.cutKg * ing.co2PerKg;
    d.savedKg += o.cutKg;
    d.onPlan ||= o.cutKg > 0;
    days.set(o.date, d);
  }
  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export interface Summary {
  savedLast30: number;
  co2Last30: number;
  kgLast30: number; // food not bought, prepped, or binned
  monthlyBefore: number | null; // avg daily waste before the plan x 30
  monthlyNow: number | null; // avg daily waste, last 14 days x 30
  planStart: string | null;
  daysLogged: number;
}

export function summarize(totals: DayTotal[]): Summary {
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
    monthlyBefore: before.length >= 5 ? avg(before) * 30 : null,
    monthlyNow: recent.length >= 5 ? avg(recent) * 30 : null,
    planStart: totals.find((t) => t.onPlan)?.date ?? null,
    daysLogged: totals.length,
  };
}
