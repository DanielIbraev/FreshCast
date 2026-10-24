// Effort vs accuracy: how much staff input is worth it?
// Each plan is replayed walk-forward on simulated kitchens and scored on
// every ingredient, logged or not.

import { Ingredient } from "./types";
import { priorWasteKg, REDUCTION_RATE } from "./prediction";
import { learn, accuracy, Observation, NO_LEARNING } from "./learning";
import { simulateDays, rng } from "./sim";
import { simInput } from "./backtest";
import { KitchenShape, shapeOf } from "./kitchens";
import { DEMO_PROFILE } from "./profile";

const startOf = (end: Date, weeks: number) => new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7);
const WARMUP = 14;

export interface EffortPlan {
  id: string;
  name: string;
  nights: number[]; // weekdays logged (0 = Sun)
  topK: number | null; // only the K highest-value items, null = all
  weighed: boolean; // scale vs. eyeballed with quick-amount buttons
  posGuests: boolean; // actual guest count pulled from the register at close
}

const ALL = [0, 1, 2, 3, 4, 5, 6];
export const PLANS: EffortPlan[] = [
  { id: "none", name: "No logging", nights: [], topK: null, weighed: false, posGuests: false },
  { id: "top3x3", name: "Top 3 items, 3 nights a week", nights: [1, 3, 5], topK: 3, weighed: false, posGuests: false },
  { id: "top5", name: "Top 5 items, nightly", nights: ALL, topK: 5, weighed: false, posGuests: false },
  { id: "all", name: "Every item, nightly", nights: ALL, topK: null, weighed: false, posGuests: false },
  { id: "all-pos", name: "Every item + guests served", nights: ALL, topK: null, weighed: false, posGuests: true },
  { id: "weighed-pos", name: "Every item weighed + guests", nights: ALL, topK: null, weighed: true, posGuests: true },
];

// Seconds per logged item: two taps on a quick amount, or scale + typing.
const SEC_EYEBALL = 8;
const SEC_WEIGHED = 25;
const SEC_CLOSEOUT = 10;
// Eyeballing with quick-amount buttons: ~30% error per entry; a scale: ~5%.
const NOISE_EYEBALL = 0.3;
const NOISE_WEIGHED = 0.05;

export function minutesPerDay(plan: EffortPlan, itemCount: number): number {
  if (!plan.nights.length) return 0;
  const items = Math.min(plan.topK ?? itemCount, itemCount);
  const perNight = items * (plan.weighed ? SEC_WEIGHED : SEC_EYEBALL) + SEC_CLOSEOUT;
  return (perNight * plan.nights.length) / 7 / 60;
}

export interface EffortResult {
  plan: EffortPlan;
  accuracy: number;
  minutes: number;
}

export function runEffort(ingredients: Ingredient[], seeds = [7, 11, 23, 31, 42], weeks = 12, kitchen: KitchenShape = shapeOf(DEMO_PROFILE)): EffortResult[] {
  const byValue = [...ingredients].sort((a, b) => b.costPerKg * b.baselinePrepKg - a.costPerKg * a.baselinePrepKg).map((i) => i.id);

  return PLANS.map((plan) => {
    const logged = new Set(plan.topK ? byValue.slice(0, plan.topK) : byValue);
    const noise = plan.weighed ? NOISE_WEIGHED : NOISE_EYEBALL;
    const scores = seeds.map((seed) => {
      const r = rng(seed * 101);
      const g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
      const days = simulateDays(ingredients, startOf(new Date(), weeks), weeks * 7, seed, kitchen);
      const warm = Math.round((WARMUP * days.length) / (weeks * 7));
      const obs: Observation[] = [];
      const pairs: { predicted: number; actual: number }[] = [];

      days.forEach((day, i) => {
        const tonight: Observation[] = [];
        for (const ing of ingredients) {
          const input = simInput(ing, day, kitchen);
          const raw = priorWasteKg(input);
          const L = obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
          const forecast = raw * L.calibration * L.weekday * L.weather * L.recency;
          const actual = day.trueUsual[ing.id];
          if (i >= warm) pairs.push({ predicted: forecast, actual });

          if (!plan.nights.includes(day.dateObj.getDay()) || !logged.has(ing.id)) continue;
          const cut = forecast * REDUCTION_RATE;
          const trueBinned = Math.max(0, actual - cut);
          const binned = trueBinned * Math.exp(noise * g() - (noise * noise) / 2);
          // With the real guest count, the prior is recomputed for who actually came,
          // so a busy walk-in night isn't mistaken for a kitchen habit.
          const priorKg = plan.posGuests ? priorWasteKg(simInput(ing, day, kitchen, day.actualCovers)) : raw;
          tonight.push({ date: day.date, ingredientId: ing.id, rawKg: priorKg, usualKg: binned + cut, condition: day.weather.condition, censored: trueBinned === 0 });
        }
        obs.push(...tonight);
      });
      return accuracy(pairs);
    });
    return { plan, accuracy: scores.reduce((s, x) => s + x, 0) / scores.length, minutes: minutesPerDay(plan, ingredients.length) };
  });
}

// The owner's own best guess: he remembers exactly what was wasted on the same
// weekday for the last 4 weeks and preps to that average. A generous baseline,
// since no owner actually knows those numbers without logging.
export function ownerBaseline(ingredients: Ingredient[], seeds = [7, 11, 23, 31, 42], weeks = 12, kitchen: KitchenShape = shapeOf(DEMO_PROFILE)): number {
  const scores = seeds.map((seed) => {
    const days = simulateDays(ingredients, startOf(new Date(), weeks), weeks * 7, seed, kitchen);
    const warm = Math.round((WARMUP * days.length) / (weeks * 7));
    const byDate = new Map(days.map((d) => [d.date, d]));
    const back = (d: Date, k: number) => {
      const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - k);
      return byDate.get(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`);
    };
    const pairs: { predicted: number; actual: number }[] = [];
    days.forEach((day, i) => {
      if (i < warm) return;
      for (const ing of ingredients) {
        const prev = [7, 14, 21, 28].map((k) => back(day.dateObj, k)).filter((d): d is NonNullable<typeof d> => !!d).map((d) => d.trueUsual[ing.id]);
        if (!prev.length) continue;
        pairs.push({ predicted: prev.reduce((s, x) => s + x, 0) / prev.length, actual: day.trueUsual[ing.id] });
      }
    });
    return accuracy(pairs);
  });
  return scores.reduce((s, x) => s + x, 0) / scores.length;
}
