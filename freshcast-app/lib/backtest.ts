// Walk-forward backtest: replay 12 weeks of a simulated kitchen day by day.
// Each morning the model forecasts using only logs from earlier days and the
// kitchen's usual guests for that weekday (no reservation feed). Each night
// the kitchen logs what was actually wasted and how many guests came.
// Accuracy is scored against the simulated truth, never against the model.

import { Ingredient, PredictionInput } from "./types";
import { priorWasteKg, computeSignals, REDUCTION_RATE, BASE_WASTE_FRACTION, usualPrepKg, MAX_WASTE_SHARE } from "./prediction";
import { learn, accuracy, Observation, NO_LEARNING } from "./learning";
import { simulateDays, SimDay } from "./sim";
import type { DailyObservation } from "./db";
import { range } from "./uncertainty";
import { KitchenShape, shapeOf } from "./kitchens";
import { DEMO_PROFILE } from "./profile";

export interface WeekResult {
  week: number;
  naive: number; // flat rule of thumb: 8% of the day's prep
  priorOnly: number; // priors, no learning
  learned: number; // FreshCast with learning
  ceiling: number; // oracle: knows the simulator's hidden parameters, not tonight's guests or noise
}

export interface BacktestResult {
  weeks: WeekResult[];
  observations: Observation[];
  // Same nights, in the shape the database stores (used to seed demo history)
  closeouts: DailyObservation[];
  days: SimDay[];
}

const MARCO = () => shapeOf(DEMO_PROFILE);

// Model inputs for one simulated day. `covers` is the usual weekday count in
// the morning, or the real count at close-out.
export function simInput(ing: Ingredient, day: SimDay, k: KitchenShape, covers = day.usualCovers): PredictionInput {
  return {
    ingredient: ing,
    expectedCovers: covers,
    usualCovers: day.usualCovers,
    avgCovers: k.avgCovers,
    weather: day.weather,
    weatherSource: "live",
    date: day.dateObj,
    event: day.event,
    cuisineType: "italian", // unused by the math; kept for the input type
  };
}

const startOf = (end: Date, weeks: number) => new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7);

// Model versions, each adding signals on top of the last. Same kitchen, same
// 12 weeks, scored the same way.
export const VERSIONS = [
  { id: "v0", name: "Rule of thumb", detail: "8% of each day's usual prep", priors: [] as string[], learning: 0 },
  { id: "v1", name: "+ Weather, season, holidays", detail: "Open-Meteo forecast and the calendar", priors: ["weather", "season", "holiday", "event"], learning: 0 },
  { id: "v2", name: "+ Shelf life", detail: "Day-old food is binned more often", priors: ["weather", "season", "holiday", "event", "shelfLife"], learning: 0 },
  { id: "v3", name: "+ Kitchen calibration", detail: "Learns each item from your close-outs", priors: ["demand", "weather", "season", "holiday", "event", "shelfLife"], learning: 1 },
  { id: "v4", name: "+ Weekday, weather & recency learning", detail: "Learns your habits by weekday, how rain hits you, and last week", priors: ["demand", "weather", "season", "holiday", "event", "shelfLife"], learning: 2 },
] as const;

export interface VersionResult {
  id: string;
  name: string;
  detail: string;
  accuracy: number; // after a 2-week warm-up
}

// Scored from the 15th open day on (2-week warm-up for a 7-day kitchen).
const WARMUP = 14;

export function runAblation(ingredients: Ingredient[], seeds = [7, 11, 23, 31, 42], weeks = 12, kitchen: KitchenShape = MARCO()): VersionResult[] {
  return VERSIONS.map((v) => {
    const scores = seeds.map((seed) => {
      const days = simulateDays(ingredients, startOf(new Date(), weeks), weeks * 7, seed, kitchen);
      const warm = Math.round((WARMUP * days.length) / (weeks * 7));
      const obs: Observation[] = [];
      const pairs: { predicted: number; actual: number }[] = [];
      days.forEach((day, i) => {
        for (const ing of ingredients) {
          const priorFor = (covers: number) => {
            const input = simInput(ing, day, kitchen, covers);
            const prep = usualPrepKg(ing.baselinePrepKg, day.usualCovers, kitchen.avgCovers);
            const m = computeSignals(input).filter((s) => (v.priors as readonly string[]).includes(s.key)).reduce((a, s) => a * s.value, 1);
            return Math.min(prep * MAX_WASTE_SHARE, prep * BASE_WASTE_FRACTION * m);
          };
          const raw = priorFor(day.usualCovers);
          const L = v.learning > 0 && obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
          const forecast = raw * L.calibration * (v.learning > 1 ? L.weekday * L.weather * L.recency : 1);
          const actual = day.trueUsual[ing.id];
          if (i >= warm) pairs.push({ predicted: forecast, actual });
          const cut = forecast * REDUCTION_RATE;
          const logged = Math.max(0, actual - cut);
          // Close-out uses the guest count from the register, like the product does
          obs.push({ date: day.date, ingredientId: ing.id, rawKg: priorFor(day.actualCovers), usualKg: logged + cut, condition: day.weather.condition, censored: logged === 0 && cut > 0 });
        }
      });
      return accuracy(pairs);
    });
    return { id: v.id, name: v.name, detail: v.detail, accuracy: scores.reduce((s, x) => s + x, 0) / scores.length };
  });
}

// planStartDay: open days before the kitchen started prepping to FreshCast's plan.
export function runBacktest(ingredients: Ingredient[], weeks = 12, seed = 7, end = new Date(), planStartDay = 0, kitchen: KitchenShape = MARCO()): BacktestResult {
  const days = simulateDays(ingredients, startOf(end, weeks), weeks * 7, seed, kitchen);
  const obs: Observation[] = [];
  const closeouts: DailyObservation[] = [];
  const buckets: Record<"naive" | "priorOnly" | "learned" | "ceiling", { predicted: number; actual: number }[]>[] = [];
  const start = startOf(end, weeks);

  days.forEach((day, i) => {
    const w = Math.floor((day.dateObj.getTime() - start.getTime()) / (7 * 86_400_000));
    buckets[w] ??= { naive: [], priorOnly: [], learned: [], ceiling: [] };
    for (const ing of ingredients) {
      const input = simInput(ing, day, kitchen);
      const raw = priorWasteKg(input);
      const L = obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
      const forecast = raw * L.calibration * L.weekday * L.weather * L.recency;
      const actual = day.trueUsual[ing.id];
      const prep = usualPrepKg(ing.baselinePrepKg, day.usualCovers, kitchen.avgCovers);

      buckets[w].naive.push({ predicted: prep * BASE_WASTE_FRACTION, actual });
      buckets[w].priorOnly.push({ predicted: raw, actual });
      buckets[w].learned.push({ predicted: forecast, actual });
      buckets[w].ceiling.push({ predicted: day.trueMeanAtPrep[ing.id], actual });

      // Tonight: kitchen prepped to plan, then logged what went in the bin.
      // If the plan cut more than would have been wasted, the item sold out:
      // the log reads 0, so "usual" (logged + cut) overstates the truth.
      // Those nights are flagged censored.
      const cut = i >= planStartDay ? forecast * REDUCTION_RATE : 0;
      const logged = Math.max(0, actual - cut);
      const priorActual = priorWasteKg(simInput(ing, day, kitchen, day.actualCovers));
      const censored = logged === 0 && cut > 0;
      obs.push({ date: day.date, ingredientId: ing.id, rawKg: priorActual, usualKg: logged + cut, condition: day.weather.condition, censored });
      const r3 = (n: number) => Math.round(n * 1000) / 1000;
      closeouts.push({ date: day.date, ingredientId: ing.id, priorKg: r3(priorActual), cutKg: r3(cut), loggedKg: r3(logged), weather: day.weather.condition, covers: day.actualCovers });
    }
  });

  return {
    weeks: buckets
      .map((b, i) => (b ? { week: i + 1, naive: accuracy(b.naive), priorOnly: accuracy(b.priorOnly), learned: accuracy(b.learned), ceiling: accuracy(b.ceiling) } : null))
      .filter((x): x is WeekResult => x !== null),
    observations: obs,
    closeouts,
    days,
  };
}

// Share of nights whose actual waste fell inside the 80% range forecast for
// them that morning. Ranges come only from residuals of earlier nights, built
// the same way the app builds them (lib/uncertainty.ts). Spec Req 3.
export function coverage(ingredients: Ingredient[], seeds = [7, 11, 23, 31, 42], weeks = 12, kitchen: KitchenShape = MARCO()): number {
  let hits = 0;
  let total = 0;
  for (const seed of seeds) {
    const days = simulateDays(ingredients, startOf(new Date(), weeks), weeks * 7, seed, kitchen);
    const warm = Math.round((WARMUP * days.length) / (weeks * 7));
    const obs: Observation[] = [];
    const own = new Map<string, number[]>();
    const pooled: number[] = [];
    days.forEach((day, i) => {
      const tonight: { obs: Observation; r: number | null }[] = [];
      for (const ing of ingredients) {
        const input = simInput(ing, day, kitchen);
        const L = obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
        const forecast = priorWasteKg(input) * L.calibration * L.weekday * L.weather * L.recency;
        const actual = day.trueUsual[ing.id];
        if (i >= warm) {
          const rg = range(forecast, own.get(ing.id) ?? [], pooled);
          total++;
          if (actual >= rg.low && actual <= rg.high) hits++;
        }
        const cut = forecast * REDUCTION_RATE;
        const logged = Math.max(0, actual - cut);
        const censored = logged === 0 && cut > 0;
        const usual = logged + cut;
        const priorActual = priorWasteKg(simInput(ing, day, kitchen, day.actualCovers));
        // Same residual the app stores: actual vs. the forecast shown that
        // morning. Censored nights have no true actual, so no residual.
        tonight.push({ obs: { date: day.date, ingredientId: ing.id, rawKg: priorActual, usualKg: usual, condition: day.weather.condition, censored }, r: censored ? null : Math.log(usual / forecast) });
      }
      for (const t of tonight) {
        obs.push(t.obs);
        if (t.r === null) continue;
        pooled.push(t.r);
        (own.get(t.obs.ingredientId) ?? own.set(t.obs.ingredientId, []).get(t.obs.ingredientId)!).push(t.r);
      }
    });
  }
  return hits / total;
}
