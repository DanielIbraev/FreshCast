// Online learning: turns the restaurant's own waste logs into correction
// factors on top of the model's industry priors. No LLM; just running
// statistics with Bayesian shrinkage so a single odd day can't swing it.

export interface Observation {
  date: string; // YYYY-MM-DD
  ingredientId: string;
  rawKg: number; // prior-only forecast for "prep as usual" (signals 1-7)
  usualKg: number; // observed: logged waste + amount the plan cut from prep
  condition: string; // weather that day
  morningKg?: number; // the forecast the kitchen actually saw that morning, if known
}

export interface Learned {
  calibration: number; // per-ingredient correction
  weekday: number; // per-weekday correction learned across all ingredients
  weather: number; // correction for this weather condition, learned across all ingredients
  recency: number; // last week, same day
  days: number; // days of data for this ingredient
  lastWeekRatio: number | null;
}

const DAY_MS = 86_400_000;
const toDay = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY_MS;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Mean pulled toward 1.0 by k phantom observations (prior strength).
function shrunkMean(values: number[], k: number): number {
  return (values.reduce((s, v) => s + v, 0) + k) / (values.length + k);
}

export const NO_LEARNING: Learned = { calibration: 1, weekday: 1, weather: 1, recency: 1, days: 0, lastWeekRatio: null };

export function learn(obs: Observation[], ingredientId: string, targetDate: string, targetCondition = "normal"): Learned {
  const target = toDay(targetDate);
  const ratio = (o: Observation) => o.usualKg / o.rawKg;
  const past = obs.filter((o) => o.rawKg > 0 && toDay(o.date) < target);
  const mine = past.filter((o) => o.ingredientId === ingredientId);
  if (past.length === 0) return NO_LEARNING;

  // 1. How this kitchen handles this ingredient (last 28 days). Items nobody
  //    logs stay at 1.0 here but still get the pooled weekday/weather fixes.
  const recent = mine.filter((o) => target - toDay(o.date) <= 28);
  const calibration = recent.length ? clamp(shrunkMean(recent.map(ratio), 2), 0.4, 2.5) : 1;

  // 2. Is this weekday busier or slower than the model's prior thinks? (last 8 weeks)
  const perIngredientCal = new Map<string, number>();
  const calFor = (id: string) => {
    if (!perIngredientCal.has(id)) {
      const xs = past.filter((o) => o.ingredientId === id && target - toDay(o.date) <= 28).map(ratio);
      perIngredientCal.set(id, xs.length ? shrunkMean(xs, 2) : 1);
    }
    return perIngredientCal.get(id)!;
  };
  const sameWeekday = past.filter((o) => (target - toDay(o.date)) % 7 === 0 && target - toDay(o.date) <= 56);
  const weekday = clamp(shrunkMean(sameWeekday.map((o) => ratio(o) / calFor(o.ingredientId)), 4), 0.6, 1.6);

  // 3. Does this weather hit this kitchen harder than the prior assumes? (last 8 weeks)
  const sameWeather = past.filter((o) => o.condition === targetCondition && target - toDay(o.date) <= 56);
  const weather = clamp(shrunkMean(sameWeather.map((o) => ratio(o) / calFor(o.ingredientId)), 6), 0.6, 1.6);

  // 4. Last week, same day, for this ingredient (partial weight)
  const lw = mine.find((o) => target - toDay(o.date) === 7);
  const lastWeekRatio = lw ? ratio(lw) : null;
  const recency = lw ? clamp(0.3 * (ratio(lw) / (calibration * weekday * weather)) + 0.7, 0.75, 1.3) : 1;

  return { calibration, weekday, weather, recency, days: new Set(mine.map((o) => o.date)).size, lastWeekRatio };
}

// Standard forecasting accuracy: 1 - weighted absolute percentage error.
export function accuracy(pairs: { predicted: number; actual: number }[]): number {
  const err = pairs.reduce((s, p) => s + Math.abs(p.predicted - p.actual), 0);
  const total = pairs.reduce((s, p) => s + p.actual, 0);
  return total > 0 ? Math.max(0, 1 - err / total) : 0;
}
