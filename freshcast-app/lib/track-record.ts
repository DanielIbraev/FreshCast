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

// One scored item-night: morning forecast f vs. "prepped as usual" waste a.
type Scored = { date: string; id: string; f: number; a: number; hit: boolean; cond: string };

const pctOf = (x: number) => Math.round(Math.abs(x) * 100);
const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
const RAINY = new Set(["rain", "storm"]);

// Mean log residual per night (pooled across items), so one night counts once
// however many items it logged. A group's effect is exp(mean) − 1: +0.14 means
// waste ran 14% above the forecast. `sure` = at least 4 nights and the mean is
// more than 2 standard errors from zero, so noise alone rarely triggers it.
function nightResiduals(xs: Scored[]) {
  const by = new Map<string, { sum: number; n: number; cond: string }>();
  for (const x of xs) {
    const e = by.get(x.date) ?? { sum: 0, n: 0, cond: x.cond };
    e.sum += Math.log(x.a / x.f);
    e.n++;
    by.set(x.date, e);
  }
  return Array.from(by, ([date, e]) => ({ date, r: e.sum / e.n, cond: e.cond }));
}
function effect(rs: number[]) {
  const n = rs.length;
  const mean = n ? rs.reduce((s, r) => s + r, 0) / n : 0;
  const sd = n > 1 ? Math.sqrt(rs.reduce((s, r) => s + (r - mean) ** 2, 0) / (n - 1)) : Infinity;
  return { n, pct: Math.exp(mean) - 1, sure: n >= 4 && Math.abs(mean) > (2 * sd) / Math.sqrt(n) };
}
const dir = (p: number) => (p > 0 ? "above" : "below");

// "What would improve accuracy": specific findings from this kitchen's own
// close-outs, most useful first, at most 5. Every number comes from `scored`.
function buildActions(items: ItemRecord[], scored: Scored[], dates: string[], profile: Profile): Action[] {
  const pairs = (xs: Scored[]) => xs.map((x) => ({ predicted: x.f, actual: x.a }));
  const last28 = new Set(dates.slice(-28));
  const out: Action[] = [];

  const unlogged = items.filter((i) => i.nights < 10);
  if (unlogged.length) out.push({ kind: "log-more", link: "log", text: `${unlogged.map((i) => i.name).join(", ")}: ${unlogged.length === 1 ? "fewer than 10 nights logged" : "each has fewer than 10 nights logged"}. Ranges stay wide until they have more.` });

  // Weakest item over the last 4 weeks, with the most likely reason.
  const rated = items.filter((i) => i.accuracy !== null && i.scored >= 5).sort((a, b) => a.accuracy! - b.accuracy!);
  const weak = rated.length >= 2 ? rated[0] : null;
  if (weak) {
    const at = `is the weakest item at ${Math.round(weak.accuracy! * 100)}% over 4 weeks`;
    if (weak.scored < 10) out.push({ kind: "weakest", itemId: weak.id, lead: weak.name, link: "log", text: `${at}, but it needs more nights: ${weak.scored} scored so far.` });
    else if (weak.soldOut >= 3) out.push({ kind: "weakest", itemId: weak.id, lead: weak.name, link: "kitchen", text: `${at}. It logged zero after a cut on ${weak.soldOut} nights, so it may be selling out. Raise its usual prep if it ran out during service.` });
    else if (weak.bias !== null && Math.abs(weak.bias) >= 0.08) out.push({ kind: "weakest", itemId: weak.id, lead: weak.name, link: "kitchen", text: `${at}. Its forecast runs ${pctOf(weak.bias)}% ${weak.bias > 0 ? "high" : "low"}; calibration is catching up.` });
    else out.push({ kind: "weakest", itemId: weak.id, lead: weak.name, text: `${at}. Its misses go both ways (average within ${Math.max(1, pctOf(weak.bias ?? 0))}%), so they are night-to-night swings, not a wrong setting.` });
  }

  for (const i of items.filter((x) => x.id !== weak?.id && x.soldOut >= 3).sort((a, b) => b.soldOut - a.soldOut).slice(0, 2))
    out.push({ kind: "sold-out", itemId: i.id, lead: i.name, link: "kitchen", text: `logged zero after a cut on ${i.soldOut} nights. It may have sold out, so those nights aren't scored. If it ran out during service, raise its usual prep.` });
  for (const i of items.filter((x) => x.id !== weak?.id && (x.status === "over" || x.status === "under")).slice(0, 2))
    out.push({ kind: "bias", itemId: i.id, lead: i.name, link: "kitchen", text: `has been forecast ${pctOf(i.bias!)}% ${i.status === "over" ? "too high" : "too low"} over the last 4 weeks. Calibration is catching up; check its usual prep if it stays.` });

  // Weekday and weather patterns the forecast hasn't absorbed yet, last 8 weeks.
  const last56 = new Set(dates.slice(-56));
  const nights = nightResiduals(scored.filter((x) => last56.has(x.date)));
  const days = DAYS.map((name, d) => ({ name, ...effect(nights.filter((n) => parseLocalDate(n.date).getDay() === d).map((n) => n.r)) })).filter((d) => d.n >= 4);
  const dayHit = days.filter((d) => d.sure && Math.abs(d.pct) > 0.1).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))[0];
  const dayMax = [...days].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))[0];
  let later: Action[] = [];
  if (dayHit) out.push({ kind: "weekday", lead: dayHit.name, text: `run ${pctOf(dayHit.pct)}% ${dir(dayHit.pct)} the forecast over the last 8 weeks (${dayHit.n} nights). The weekday correction is learning it.` });
  else if (days.length >= 3 && dayMax && Math.abs(dayMax.pct) <= 0.1)
    later.push({ kind: "weekday", ok: true, text: `No weekday runs more than 10% off the forecast over the last 8 weeks. The largest gap is ${dayMax.name} at ${pctOf(dayMax.pct)}% ${dir(dayMax.pct)}.` });

  const rain = effect(nights.filter((n) => RAINY.has(n.cond)).map((n) => n.r));
  const dry = effect(nights.filter((n) => !RAINY.has(n.cond)).map((n) => n.r));
  if (rain.n >= 4) {
    if (rain.sure && Math.abs(rain.pct) > 0.1) out.push({ kind: "weather", lead: "Rainy nights", text: `run ${pctOf(rain.pct)}% ${dir(rain.pct)} the forecast (${rain.n} nights in 8 weeks), dry nights ${pctOf(dry.pct)}% ${dir(dry.pct)}. The weather correction is learning it.` });
    else if (Math.abs(rain.pct) <= 0.1) later.push({ kind: "weather", ok: true, lead: "Rainy nights", text: `land within ${Math.max(1, pctOf(rain.pct))}% of the forecast on average (${rain.n} in 8 weeks). The rain signal is holding.` });
  }

  if (profile.coversSource !== "pos-import") out.push({ kind: "guests", link: "kitchen", text: "Weekday guest counts are estimates from setup. Importing a sales export replaces them with your real averages." });

  // Most improved: an item's first 14 scored nights vs. its last 4 weeks.
  const gains = items.flatMap((i) => {
    const own = scored.filter((x) => x.id === i.id);
    const early = own.slice(0, 14).filter((x) => !last28.has(x.date));
    const late = own.filter((x) => last28.has(x.date));
    if (early.length < 7 || late.length < 10) return [];
    return [{ i, from: accuracy(pairs(early)), to: accuracy(pairs(late)) }];
  });
  const best = gains.sort((a, b) => b.to - b.from - (a.to - a.from))[0];
  if (best && best.to - best.from >= 0.05)
    out.push({ kind: "improved", itemId: best.i.id, lead: best.i.name, text: `${Math.round(best.from * 100)}% → ${Math.round(best.to * 100)}% since its first two weeks of scoring, the biggest gain on the menu.` });

  out.push(...later);
  if (!out.length) out.push({ kind: "keep-going", text: "Every item is within 15% on average. Keep logging nightly to hold it there." });

  // At most 5, but the sales-import step always stays on the list when it applies.
  const top = out.slice(0, 5);
  const guests = out.find((a) => a.kind === "guests");
  return guests && !top.includes(guests) ? [...top.slice(0, 4), guests] : top;
}

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
        scored.push({ date, id: ing.id, f, a: o.usualKg, hit: o.usualKg >= rg.low && o.usualKg <= rg.high, cond: o.condition });
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
