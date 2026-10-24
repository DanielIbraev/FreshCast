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
