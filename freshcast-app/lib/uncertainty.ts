// Forecast confidence ranges, learned from the kitchen's own past errors.
// Spec: .kiro/specs/forecast-confidence. A residual is ln(actual / forecast)
// for a past night. The forecast is the one shown that morning when we know it
// (it includes walk-in uncertainty); otherwise it's rebuilt walk-forward. The 80% range is forecast x exp(10th..90th percentile).

import { learn, Observation } from "./learning";
import { DayPrediction } from "./types";

export interface Residuals {
  byIngredient: Map<string, number[]>;
  pooled: number[];
  byDay: number[]; // residual of the day's total forecast cost vs total actual cost
}

export interface Range {
  low: number;
  high: number;
  source: "own" | "blended" | "cold-start";
  n: number;
}

const COLD_START = { lo: Math.log(0.65), hi: Math.log(1.45) };
const MIN_OWN = 10;

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const i = Math.floor(pos);
  return sorted[i] + (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (pos - i);
}

function bounds(xs: number[], level: number): { lo: number; hi: number } {
  const s = [...xs].sort((a, b) => a - b);
  const tail = (1 - level) / 2;
  return { lo: quantile(s, tail), hi: quantile(s, 1 - tail) };
}

// costPerKg weights the day total by dollars, so it matches the $ range it's applied to.
export function residuals(obs: Observation[], costPerKg: Map<string, number> = new Map()): Residuals {
  const byIngredient = new Map<string, number[]>();
  const pooled: number[] = [];
  const days = new Map<string, { f: number; a: number }>();
  for (const o of obs) {
    if (o.censored || !(o.rawKg > 0) || !(o.usualKg > 0)) continue;
    const f = o.morningKg ?? (() => {
      const L = learn(obs, o.ingredientId, o.date, o.condition); // learn() only sees earlier dates
      return o.rawKg * L.calibration * L.weekday * L.weather * L.recency;
    })();
    if (!(f > 0)) continue;
    const r = Math.log(o.usualKg / f);
    pooled.push(r);
    (byIngredient.get(o.ingredientId) ?? byIngredient.set(o.ingredientId, []).get(o.ingredientId)!).push(r);
    const d = days.get(o.date) ?? { f: 0, a: 0 };
    const c = costPerKg.get(o.ingredientId) ?? 1;
    d.f += f * c;
    d.a += o.usualKg * c;
    days.set(o.date, d);
  }
  const byDay = Array.from(days.values()).filter((d) => d.f > 0 && d.a > 0).map((d) => Math.log(d.a / d.f));
  return { byIngredient, pooled, byDay };
}

// Own residuals once there are enough; before that, blend own and pooled
// quantiles weighted by n/10; with nothing at all, a wide cold-start band.
export function range(forecast: number, own: number[], pooled: number[], level = 0.8): Range {
  const n = own.length;
  let lo: number;
  let hi: number;
  let source: Range["source"];
  if (n >= MIN_OWN) {
    ({ lo, hi } = bounds(own, level));
    source = "own";
  } else if (n > 0 || pooled.length > 0) {
    const p = pooled.length ? bounds(pooled, level) : COLD_START;
    const o = n > 0 ? bounds(own, level) : p;
    const w = n / MIN_OWN;
    lo = w * o.lo + (1 - w) * p.lo;
    hi = w * o.hi + (1 - w) * p.hi;
    source = "blended";
  } else {
    ({ lo, hi } = COLD_START);
    source = "cold-start";
  }
  const f = Math.max(0, forecast);
  return { low: Math.min(f, f * Math.exp(lo)), high: Math.max(f, f * Math.exp(hi)), source, n };
}

const r2 = (x: number) => Math.round(x * 100) / 100;

export function withRanges(day: DayPrediction, R: Residuals): DayPrediction {
  const ingredients = day.ingredients.map((p) => {
    const rg = range(p.predictedWasteKg, R.byIngredient.get(p.ingredient.id) ?? [], R.pooled);
    return {
      ...p,
      lowKg: r2(rg.low),
      highKg: r2(rg.high),
      lowCost: r2(rg.low * p.ingredient.costPerKg),
      highCost: r2(rg.high * p.ingredient.costPerKg),
      rangeSource: rg.source,
      rangeN: rg.n,
    };
  });
  const total = range(day.totalWasteCost, R.byDay, R.byDay.length ? R.byDay : R.pooled);
  return { ...day, ingredients, totalLow: r2(total.low), totalHigh: r2(total.high) };
}
