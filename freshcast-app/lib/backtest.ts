// Walk-forward backtest: replay 12 weeks of a simulated kitchen day by day.
// Each morning the model forecasts using only logs from earlier days; each
// night the kitchen logs what was actually wasted. Accuracy is scored against
// the simulated truth, never against the model's own numbers.

import { Ingredient } from "./types";
import { AVG_COVERS, DEMO_RESTAURANT } from "./demo-data";
import { priorWasteKg, computeSignals, REDUCTION_RATE, BASE_WASTE_FRACTION } from "./prediction";
import { learn, accuracy, Observation, NO_LEARNING } from "./learning";
import { simulateDays, SimDay } from "./sim";
import type { DailyObservation } from "./db";
import { range } from "./uncertainty";

export interface WeekResult {
  week: number;
  naive: number; // flat rule of thumb: 8% of prep, every day
  priorOnly: number; // FreshCast v1: industry priors, no learning
  learned: number; // FreshCast with learning
  ceiling: number; // best possible at prep time: knows the kitchen's true habits, has only reservations
}

export interface BacktestResult {
  weeks: WeekResult[];
  observations: Observation[];
  // Same nights, in the shape the database stores (used to seed Marco's history)
  closeouts: DailyObservation[];
  days: SimDay[];
}

// Model versions, each adding signals on top of the last. This is the
// "iterations" story: same kitchen, same 12 weeks, scored the same way.
export const VERSIONS = [
  { id: "v0", name: "Rule of thumb", detail: "Flat 8% of prep, every day", priors: [] as string[], learning: 0 },
  { id: "v1", name: "+ Covers & weekday", detail: "Reservations and day-of-week priors", priors: ["demand", "dayOfWeek"], learning: 0 },
  { id: "v2", name: "+ Weather, season, events", detail: "Open-Meteo, calendar, events feed", priors: ["demand", "dayOfWeek", "weather", "season", "holiday", "event", "shelfLife"], learning: 0 },
  { id: "v3", name: "+ Kitchen calibration", detail: "Learns each ingredient from your logs", priors: ["demand", "dayOfWeek", "weather", "season", "holiday", "event", "shelfLife"], learning: 1 },
  { id: "v4", name: "+ Weekday, weather & recency learning", detail: "Learns your busy days, how rain hits you, and last week", priors: ["demand", "dayOfWeek", "weather", "season", "holiday", "event", "shelfLife"], learning: 2 },
] as const;

export interface VersionResult {
  id: string;
  name: string;
  detail: string;
  accuracy: number; // over weeks 3-12, after a 2-week warm-up
}

export function runAblation(ingredients: Ingredient[], seeds = [7, 11, 23, 31, 42], weeks = 12): VersionResult[] {
  return VERSIONS.map((v) => {
    const scores = seeds.map((seed) => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7);
      const days = simulateDays(ingredients, start, weeks * 7, seed);
      const obs: Observation[] = [];
      const pairs: { predicted: number; actual: number }[] = [];
      days.forEach((day, i) => {
        for (const ing of ingredients) {
          const priorFor = (covers: number) =>
            ing.baselinePrepKg *
            BASE_WASTE_FRACTION *
            computeSignals({ ingredient: ing, expectedCovers: covers, avgCovers: AVG_COVERS, weather: day.weather, weatherSource: "live", date: day.dateObj, event: day.event, cuisineType: DEMO_RESTAURANT.cuisineType })
              .filter((s) => (v.priors as readonly string[]).includes(s.key))
              .reduce((a, s) => a * s.value, 1);
          const raw = priorFor(day.expectedCovers);
          const L = v.learning > 0 && obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
          const forecast = raw * L.calibration * (v.learning > 1 ? L.weekday * L.weather * L.recency : 1);
          const actual = day.trueUsual[ing.id];
          if (i >= 14) pairs.push({ predicted: forecast, actual });
          const cut = forecast * REDUCTION_RATE;
          // Close-out uses the guest count from the register, like the product does
          obs.push({ date: day.date, ingredientId: ing.id, rawKg: priorFor(day.actualCovers), usualKg: Math.max(0, actual - cut) + cut, condition: day.weather.condition });
        }
      });
      return accuracy(pairs);
    });
    return { id: v.id, name: v.name, detail: v.detail, accuracy: scores.reduce((s, x) => s + x, 0) / scores.length };
  });
}

// planStartDay: days before the kitchen started prepping to FreshCast's plan.
export function runBacktest(ingredients: Ingredient[], weeks = 12, seed = 7, end = new Date(), planStartDay = 0): BacktestResult {
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7);
  const days = simulateDays(ingredients, start, weeks * 7, seed);
  const obs: Observation[] = [];
  const closeouts: DailyObservation[] = [];
  const buckets: Record<"naive" | "priorOnly" | "learned" | "ceiling", { predicted: number; actual: number }[]>[] = [];

  days.forEach((day, i) => {
    const w = Math.floor(i / 7);
    buckets[w] ??= { naive: [], priorOnly: [], learned: [], ceiling: [] };
    for (const ing of ingredients) {
      const input = {
        ingredient: ing,
        expectedCovers: day.expectedCovers,
        avgCovers: AVG_COVERS,
        weather: day.weather,
        weatherSource: "live" as const,
        date: day.dateObj,
        event: day.event,
        cuisineType: DEMO_RESTAURANT.cuisineType,
      };
      const raw = priorWasteKg(input);
      const L = obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
      const forecast = raw * L.calibration * L.weekday * L.weather * L.recency;
      const actual = day.trueUsual[ing.id];

      buckets[w].naive.push({ predicted: ing.baselinePrepKg * BASE_WASTE_FRACTION, actual });
      buckets[w].priorOnly.push({ predicted: raw, actual });
      buckets[w].learned.push({ predicted: forecast, actual });
      buckets[w].ceiling.push({ predicted: day.trueMeanAtPrep[ing.id], actual });

      // Tonight: kitchen prepped to plan, then logged what went in the bin.
      // If the plan cut more than would have been wasted, the item sold out;
      // the log reads 0 and the observation is censored at the cut amount.
      const cut = i >= planStartDay ? forecast * REDUCTION_RATE : 0;
      const logged = Math.max(0, actual - cut);
      const priorActual = priorWasteKg({ ...input, expectedCovers: day.actualCovers });
      obs.push({ date: day.date, ingredientId: ing.id, rawKg: priorActual, usualKg: logged + cut, condition: day.weather.condition });
      const r3 = (n: number) => Math.round(n * 1000) / 1000;
      closeouts.push({ date: day.date, ingredientId: ing.id, priorKg: r3(priorActual), cutKg: r3(cut), loggedKg: r3(logged), weather: day.weather.condition, covers: day.actualCovers });
    }
  });

  return {
    weeks: buckets.map((b, i) => ({
      week: i + 1,
      naive: accuracy(b.naive),
      priorOnly: accuracy(b.priorOnly),
      learned: accuracy(b.learned),
      ceiling: accuracy(b.ceiling),
    })),
    observations: obs,
    closeouts,
    days,
  };
}

// Share of nights whose actual waste fell inside the 80% range forecast for
// them that morning. Ranges come only from residuals of earlier nights, built
// the same way the app builds them (lib/uncertainty.ts). Spec Req 3.
export function coverage(ingredients: Ingredient[], seeds = [7, 11, 23, 31, 42], weeks = 12): number {
  let hits = 0;
  let total = 0;
  for (const seed of seeds) {
    const end = new Date();
    const days = simulateDays(ingredients, new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7), weeks * 7, seed);
    const obs: Observation[] = [];
    const own = new Map<string, number[]>();
    const pooled: number[] = [];
    days.forEach((day, i) => {
      const tonight: { obs: Observation; r: number }[] = [];
      for (const ing of ingredients) {
        const input = { ingredient: ing, expectedCovers: day.expectedCovers, avgCovers: AVG_COVERS, weather: day.weather, weatherSource: "live" as const, date: day.dateObj, event: day.event, cuisineType: DEMO_RESTAURANT.cuisineType };
        const L = obs.length ? learn(obs, ing.id, day.date, day.weather.condition) : NO_LEARNING;
        const corr = L.calibration * L.weekday * L.weather * L.recency;
        const forecast = priorWasteKg(input) * corr;
        const actual = day.trueUsual[ing.id];
        if (i >= 14) {
          const rg = range(forecast, own.get(ing.id) ?? [], pooled);
          total++;
          if (actual >= rg.low && actual <= rg.high) hits++;
        }
        const cut = forecast * REDUCTION_RATE;
        const usual = Math.max(0, actual - cut) + cut;
        const priorActual = priorWasteKg({ ...input, expectedCovers: day.actualCovers });
        // Same residual the app stores: actual vs. the forecast shown that morning.
        tonight.push({ obs: { date: day.date, ingredientId: ing.id, rawKg: priorActual, usualKg: usual, condition: day.weather.condition }, r: Math.log(usual / forecast) });
      }
      for (const t of tonight) {
        obs.push(t.obs);
        pooled.push(t.r);
        (own.get(t.obs.ingredientId) ?? own.set(t.obs.ingredientId, []).get(t.obs.ingredientId)!).push(t.r);
      }
    });
  }
  return hits / total;
}
