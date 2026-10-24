// How the forecast has done for THIS restaurant, from its own close-outs.
// Scored walk-forward and leak-free: each night is compared with the forecast
// the kitchen saw that morning (usual weekday guests, that day's weather,
// corrections learned only from earlier nights), never with a forecast that
// already knew how many guests came.
//
// "Actual" is waste if the kitchen had prepped as usual = what was binned
// (over-prep + spoiled) + what the plan didn't prep. Nights where an item
// sold out after a cut are censored: the true number is unknown, so they are
// shown but not scored.

import { DailyObservation, toLearningObs } from "./db";
import { learn, accuracy, Observation } from "./learning";
import { priorWasteKg } from "./prediction";
import { range } from "./uncertainty";
import { parseLocalDate } from "./demo-data";
import { Ingredient, WeatherCondition } from "./types";
import { Profile } from "./profile";

export interface NightTotal {
  date: string;
  forecastCost: number; // morning forecast, $ of waste if prepped as usual
  actualCost: number;
  lowCost: number; // 80% range shown that morning
  highCost: number;
  binnedCost: number; // what actually went in the bin
  onPlan: boolean;
  scoredItems: number;
}

export interface RollingPoint {
  date: string;
  accuracy: number; // last 7 open days, weighted by kg
}

export type ItemStatus = "on-target" | "learning" | "over" | "under";

export interface ItemRecord {
  id: string;
  name: string;
  nights: number; // nights logged
  scored: number; // nights scored (not censored, after warm-up)
  accuracy: number | null;
  bias: number | null; // +0.2 = forecast 20% too high on average
  rangeHit: number | null; // share of scored nights inside the 80% range
  soldOut: number; // censored nights (logged 0 after a cut)
  wasteCostLast28: number;
  status: ItemStatus;
}

export interface Action {
  kind: "log-more" | "bias" | "sold-out" | "guests" | "keep-going" | "improved" | "weakest" | "weekday" | "weather";
  text: string;
  itemId?: string;
  lead?: string; // the item or day the line is about, shown first in bold
  link?: "log" | "kitchen"; // where to act on it, if anywhere
  ok?: boolean; // a check that came back clean (no pattern found)
}

export interface TrackRecord {
  nights: NightTotal[];
  rolling: RollingPoint[];
  items: ItemRecord[];
  actions: Action[];
  planStart: string | null;
  openNights: number;
  firstTwoWeeks: number | null; // accuracy, first 14 open nights
  lastFourWeeks: number | null; // accuracy, last 28 open nights
  rangeHit: number | null;
  soldOutNights: number;
}

const WARMUP = 3; // nights before the first one is scored

// The forecast the kitchen would have seen at 8am for this past night.
function morningForecast(o: Observation, ing: Ingredient, profile: Profile, past: Observation[]): number {
  if (o.morningKg !== undefined) return o.morningKg; // recovered exactly from the prep cut
  const date = parseLocalDate(o.date);
  const usual = profile.coversByDay[date.getDay()] || profile.avgCovers;
  const raw = priorWasteKg({
    ingredient: ing,
    expectedCovers: usual,
    usualCovers: usual,
    avgCovers: profile.avgCovers,
    weather: { date: o.date, tempF: 60, condition: o.condition as WeatherCondition, precipProb: 0, description: "" },
    weatherSource: "live",
    date,
    event: { type: "none", name: "", distanceMiles: 0 },
    cuisineType: profile.cuisineType,
  });
  const L = learn(past, ing.id, o.date, o.condition);
  return raw * L.calibration * L.weekday * L.weather * L.recency;
}

export function trackRecord(stored: DailyObservation[], ingredients: Ingredient[], profile: Profile): TrackRecord {
  const obs = toLearningObs(stored);
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const dates = Array.from(new Set(obs.map((o) => o.date))).sort();
  const storedBy = new Map(stored.map((s) => [`${s.date}|${s.ingredientId}`, s]));

  const own = new Map<string, number[]>();
  const pooled: number[] = [];
  const nights: NightTotal[] = [];
  type Scored = { date: string; id: string; f: number; a: number; hit: boolean };
  const scored: Scored[] = [];
  const perItem = new Map<string, { nights: number; soldOut: number; waste28: number }>();
  const cutoff28 = dates.slice(-28)[0] ?? "";

  dates.forEach((date, di) => {
    const tonight = obs.filter((o) => o.date === date);
    const past = obs.filter((o) => o.date < date);
    const night: NightTotal = { date, forecastCost: 0, actualCost: 0, lowCost: 0, highCost: 0, binnedCost: 0, onPlan: false, scoredItems: 0 };
    const newResid: { id: string; r: number }[] = [];
    for (const o of tonight) {
      const ing = byId.get(o.ingredientId);
      if (!ing || !(o.rawKg > 0)) continue;
      const s = storedBy.get(`${date}|${o.ingredientId}`)!;
      const item = perItem.get(ing.id) ?? { nights: 0, soldOut: 0, waste28: 0 };
      item.nights++;
      if (o.censored) item.soldOut++;
      if (date >= cutoff28) item.waste28 += s.loggedKg * ing.costPerKg;
      perItem.set(ing.id, item);
      night.binnedCost += s.loggedKg * ing.costPerKg;
      night.onPlan ||= s.cutKg > 0;

      const f = morningForecast(o, ing, profile, past);
      const rg = range(f, own.get(ing.id) ?? [], pooled);
      night.forecastCost += f * ing.costPerKg;
      night.lowCost += rg.low * ing.costPerKg;
      night.highCost += rg.high * ing.costPerKg;
      night.actualCost += o.usualKg * ing.costPerKg;
      if (o.censored || !(f > 0) || !(o.usualKg > 0)) continue;
      if (di >= WARMUP) {
        scored.push({ date, id: ing.id, f, a: o.usualKg, hit: o.usualKg >= rg.low && o.usualKg <= rg.high });
        night.scoredItems++;
      }
      newResid.push({ id: ing.id, r: Math.log(o.usualKg / f) });
    }
    // Residuals become available only after tonight, like in the app.
    for (const { id, r } of newResid) {
      pooled.push(r);
      (own.get(id) ?? own.set(id, []).get(id)!).push(r);
    }
    nights.push(night);
  });

  const pairs = (xs: Scored[]) => xs.map((x) => ({ predicted: x.f, actual: x.a }));
  const rolling: RollingPoint[] = [];
  for (let k = WARMUP + 6; k < dates.length; k++) {
    const window = new Set(dates.slice(k - 6, k + 1));
    const xs = scored.filter((x) => window.has(x.date));
    if (xs.length) rolling.push({ date: dates[k], accuracy: accuracy(pairs(xs)) });
  }

  const first = new Set(dates.slice(0, 14));
  const last = new Set(dates.slice(-28));
  const pick = (s: Set<string>) => {
    const xs = scored.filter((x) => s.has(x.date));
    return xs.length ? accuracy(pairs(xs)) : null;
  };

  const items: ItemRecord[] = ingredients.map((ing) => {
    const xs = scored.filter((x) => x.id === ing.id && last.has(x.date));
    const meta = perItem.get(ing.id) ?? { nights: 0, soldOut: 0, waste28: 0 };
    const acc = xs.length ? accuracy(pairs(xs)) : null;
    const sumF = xs.reduce((s, x) => s + x.f, 0);
    const sumA = xs.reduce((s, x) => s + x.a, 0);
    const bias = xs.length && sumA > 0 ? sumF / sumA - 1 : null;
    const status: ItemStatus = xs.length < 10 ? "learning" : bias !== null && bias > 0.15 ? "over" : bias !== null && bias < -0.15 ? "under" : "on-target";
    return {
      id: ing.id,
      name: ing.name,
      nights: meta.nights,
      scored: xs.length,
      accuracy: acc,
      bias,
      rangeHit: xs.length ? xs.filter((x) => x.hit).length / xs.length : null,
      soldOut: meta.soldOut,
      wasteCostLast28: meta.waste28,
      status,
    };
  });

  const actions: Action[] = [];
  const unlogged = items.filter((i) => i.nights < 10);
  if (unlogged.length) actions.push({ kind: "log-more", text: `${unlogged.map((i) => i.name).join(", ")}: ${unlogged.length === 1 ? "fewer than 10 nights logged" : "each has fewer than 10 nights logged"}. Ranges stay wide until they have more.` });
  for (const i of items.filter((x) => x.status === "over" || x.status === "under")) {
    actions.push({ kind: "bias", itemId: i.id, text: `${i.name} has been forecast ${Math.round(Math.abs(i.bias!) * 100)}% ${i.status === "over" ? "too high" : "too low"} over the last 4 weeks. Calibration is catching up; check the usual prep amount in Kitchen if it stays.` });
  }
  for (const i of items.filter((x) => x.soldOut >= 3).sort((a, b) => b.soldOut - a.soldOut).slice(0, 2)) {
    actions.push({ kind: "sold-out", itemId: i.id, text: `${i.name} logged zero after a cut on ${i.soldOut} nights. It may have sold out, so those nights aren't scored. If it ran out during service, raise its usual prep.` });
  }
  if (profile.coversSource !== "pos-import") actions.push({ kind: "guests", text: "Weekday guest counts are estimates from setup. Importing a sales export replaces them with your real averages." });
  if (!actions.length) actions.push({ kind: "keep-going", text: "Every item is within 15% on average. Keep logging nightly to hold it there." });

  const allScored = scored.filter((x) => last.has(x.date));
  return {
    nights,
    rolling,
    items,
    actions,
    planStart: nights.find((n) => n.onPlan)?.date ?? null,
    openNights: dates.length,
    firstTwoWeeks: dates.length >= 14 ? pick(first) : null,
    lastFourWeeks: dates.length >= 14 ? pick(last) : null,
    rangeHit: allScored.length ? allScored.filter((x) => x.hit).length / allScored.length : null,
    soldOutNights: obs.filter((o) => o.censored).length,
  };
}
