// Accuracy on the restaurant's own stored close-outs, scored walk-forward:
// each day is forecast using only the days before it, then compared to what
// was logged. This is the number that would be reported to a real customer.

import { learn, accuracy, Observation } from "./learning";

export interface LiveAccuracy {
  firstTwoWeeks: number | null;
  lastFourWeeks: number | null;
  scoredDays: number;
}

export function liveAccuracy(obs: Observation[]): LiveAccuracy {
  const dates = Array.from(new Set(obs.map((o) => o.date))).sort();
  if (dates.length < 3) return { firstTwoWeeks: null, lastFourWeeks: null, scoredDays: 0 };

  const scored: { date: string; predicted: number; actual: number }[] = [];
  for (const date of dates) {
    for (const o of obs.filter((x) => x.date === date && x.rawKg > 0)) {
      const L = learn(obs, o.ingredientId, date, o.condition);
      scored.push({ date, predicted: o.rawKg * L.calibration * L.weekday * L.weather * L.recency, actual: o.usualKg });
    }
  }
  const first = new Set(dates.slice(0, 14));
  const last = new Set(dates.slice(-28));
  const pick = (s: Set<string>) => accuracy(scored.filter((x) => s.has(x.date)));
  return {
    firstTwoWeeks: dates.length >= 14 ? pick(first) : null,
    lastFourWeeks: dates.length >= 28 ? pick(last) : null,
    scoredDays: dates.length,
  };
}
