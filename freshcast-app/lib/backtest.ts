// Walk-forward backtest: replay 12 weeks of a simulated kitchen day by day.
// Each morning the model forecasts using only logs from earlier days; each
// night the kitchen logs what was actually wasted. Accuracy is scored against
// the simulated truth, never against the model's own numbers.

import { Ingredient } from "./types";
import { AVG_COVERS, DEMO_RESTAURANT } from "./demo-data";
import { priorWasteKg, REDUCTION_RATE, BASE_WASTE_FRACTION } from "./prediction";
import { learn, accuracy, Observation, NO_LEARNING } from "./learning";
import { simulateDays, SimDay } from "./sim";

export interface WeekResult {
  week: number;
  naive: number; // flat rule of thumb: 8% of prep, every day
  priorOnly: number; // FreshCast v1: industry priors, no learning
  learned: number; // FreshCast with learning
  ceiling: number; // best possible: knows the true average, can't see daily noise
}

export interface BacktestResult {
  weeks: WeekResult[];
  observations: Observation[];
  days: SimDay[];
}

// Model versions, each adding signals on top of the last. This is the
// "iterations" story: same kitchen, same 12 weeks, scored the same way.
export const VERSIONS = [
  { id: "v0", name: "Rule of thumb", detail: "Flat 8% of prep, every day", priors: [] as string[], learning: 0 },
  { id: "v1", name: "+ Covers & weekday", detail: "Reservations and day-of-week priors", priors: ["demand", "dayOfWeek"], learning: 0 },
  { id: "v2", name: "+ Weather, season, events", detail: "Open-Meteo, calendar, events feed", priors: ["demand", "dayOfWeek", "weather", "season", "holiday", "event", "cuisine"], learning: 0 },
  { id: "v3", name: "+ Kitchen calibration", detail: "Learns each ingredient from your logs", priors: ["demand", "dayOfWeek", "weather", "season", "holiday", "event", "cuisine"], learning: 1 },
  { id: "v4", name: "+ Weekday & recency learning", detail: "Learns your busy days and last week", priors: ["demand", "dayOfWeek", "weather", "season", "holiday", "event", "cuisine"], learning: 2 },
] as const;

export interface VersionResult {
  id: string;
  name: string;
  detail: string;
  accuracy: number; // over weeks 3-12, after a 2-week warm-up
}

export function runAblation(ingredients: Ingredient[], seeds = [7, 11, 23], weeks = 12): VersionResult[] {
  return VERSIONS.map((v) => {
    const scores = seeds.map((seed) => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7);
      const days = simulateDays(ingredients, start, weeks * 7, seed);
      const obs: Observation[] = [];
      const pairs: { predicted: number; actual: number }[] = [];
      days.forEach((day, i) => {
        for (const ing of ingredients) {
          const signals = computeSignals({ ingredient: ing, expectedCovers: day.expectedCovers, avgCovers: AVG_COVERS, weather: day.weather, weatherSource: "live", date: day.dateObj, event: day.event, cuisineType: DEMO_RESTAURANT.cuisineType });
          const raw = ing.baselinePrepKg * BASE_WASTE_FRACTION * signals.filter((s) => (v.priors as readonly string[]).includes(s.key)).reduce((a, s) => a * s.value, 1);
          const L = v.learning > 0 && obs.length ? learn(obs, ing.id, day.date) : NO_LEARNING;
          const forecast = raw * L.calibration * (v.learning > 1 ? L.weekday * L.recency : 1);
          const actual = day.trueUsual[ing.id];
          if (i >= 14) pairs.push({ predicted: forecast, actual });
          const cut = forecast * REDUCTION_RATE;
          obs.push({ date: day.date, ingredientId: ing.id, rawKg: raw, usualKg: Math.max(0, actual - cut) + cut });
        }
      });
      return accuracy(pairs);
    });
    return { id: v.id, name: v.name, detail: v.detail, accuracy: scores.reduce((s, x) => s + x, 0) / scores.length };
  });
}

export function runBacktest(ingredients: Ingredient[], weeks = 12, seed = 7, end = new Date()): BacktestResult {
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - weeks * 7);
  const days = simulateDays(ingredients, start, weeks * 7, seed);
  const obs: Observation[] = [];
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
      const L = obs.length ? learn(obs, ing.id, day.date) : NO_LEARNING;
      const forecast = raw * L.calibration * L.weekday * L.recency;
      const actual = day.trueUsual[ing.id];

      buckets[w].naive.push({ predicted: ing.baselinePrepKg * BASE_WASTE_FRACTION, actual });
      buckets[w].priorOnly.push({ predicted: raw, actual });
      buckets[w].learned.push({ predicted: forecast, actual });
      buckets[w].ceiling.push({ predicted: day.trueMean[ing.id], actual });

      // Tonight: kitchen prepped to plan, then logged what went in the bin.
      // If the plan cut more than would have been wasted, the item sold out;
      // the log reads 0 and the observation is censored at the cut amount.
      const cut = forecast * REDUCTION_RATE;
      const logged = Math.max(0, actual - cut);
      obs.push({ date: day.date, ingredientId: ing.id, rawKg: raw, usualKg: logged + cut });
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
    days,
  };
}
