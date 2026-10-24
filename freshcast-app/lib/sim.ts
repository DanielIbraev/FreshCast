// Simulated kitchen used for (1) seeding the demo histories and (2) the
// accuracy backtest. Weather is Boston's real recorded weather where we have it. The "true world" below is hidden from the model: its
// priors in prediction.ts are deliberately different, and the learning layer
// has to discover the gap from waste logs alone.

import { DayWeather, Ingredient, NearbyEvent, WeatherCondition } from "./types";
import { EVENTS, localISO } from "./demo-data";
import { KitchenShape, shapeOf, isOpen } from "./kitchens";
import { DEMO_PROFILE } from "./profile";
import { usualPrepKg } from "./prediction";
import { describe } from "./weather";
import history from "./history-weather.json";

// Real daily weather in Boston for recent dates (scripts/fetch-history-weather.ts).
// Nights inside that window replay on the weather that actually happened.
const REAL = (history as unknown as { days: Record<string, { tempF: number; condition: WeatherCondition; precipMm: number }> }).days;

// Seeded RNG (mulberry32) so every run produces the same kitchen.
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number): number {
  const u = Math.max(r(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

// Shared parts of the hidden world. Each kitchen adds its own guest
// sensitivity, weather response, weekday habits and per-item bias
// (lib/kitchens.ts). The model's priors are deliberately different.
export const TRUE_WORLD = {
  baseFraction: 0.08,
  season: [1.1, 1.1, 1.0, 1.0, 0.95, 0.95, 0.9, 0.9, 1.08, 1.08, 1.15, 1.15],
  event: 0.75,
  noiseSigma: 0.12, // day-to-day randomness no model can predict
  coversDrift: 0.15, // actual guests vs. the usual for that weekday
  // Real perishability effect, steeper than the model's shelfLifeFactor prior.
  shelfLife: (days: number) => (days <= 1 ? 1.3 : days <= 2 ? 1.15 : days <= 4 ? 1.0 : days <= 7 ? 0.85 : 0.75),
};

// Boston average daily high by month (°F)
const MONTH_HIGH = [36, 39, 46, 57, 67, 77, 82, 80, 73, 62, 51, 41];

export interface SimDay {
  date: string;
  dateObj: Date;
  weather: DayWeather;
  usualCovers: number; // the kitchen's usual guests for this weekday (all FreshCast knows at 8am)
  expectedCovers: number; // same as usualCovers: no reservation feed is assumed
  actualCovers: number; // who actually showed up (the register knows this at close)
  event: NearbyEvent;
  realWeather: boolean; // true when this night uses Boston's recorded weather
  trueUsual: Record<string, number>; // waste if prepped as usual (kg), with noise
  trueMean: Record<string, number>; // same, without noise, knowing who actually came
  trueMeanAtPrep: Record<string, number>; // oracle at 8am: knows the hidden parameters, not tonight's guests or noise
}

function hashBias(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return 0.8 + ((Math.abs(h) % 1000) / 1000) * 0.5;
}

// Closed weekdays produce no row at all: no prep, no waste, nothing to learn.
export function simulateDays(ingredients: Ingredient[], start: Date, numDays: number, seed: number, kitchen: KitchenShape = shapeOf(DEMO_PROFILE)): SimDay[] {
  const r = rng(seed);
  const H = kitchen.hidden;
  const days: SimDay[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dow = d.getDay();
    // Draw the same random numbers every day so open/closed days don't shift the sequence.
    const simTemp = MONTH_HIGH[d.getMonth()] + gauss(r) * 6;
    const wet = r() < 0.3;
    const stormy = r() < 0.12;
    const eventDraw = r();
    const real = REAL[localISO(d)];
    const tempF = real ? real.tempF : simTemp;
    const condition: WeatherCondition = real ? real.condition : wet ? (stormy ? "storm" : "rain") : tempF >= 85 ? "hot" : tempF <= 32 ? "cold" : "normal";
    const rainy = condition === "rain" || condition === "storm";
    const event = !rainy && eventDraw < 0.08 ? EVENTS.game : EVENTS.none;
    const drift = gauss(r);
    const noise = ingredients.map(() => gauss(r));
    if (!isOpen(kitchen, dow)) continue;

    const usual = kitchen.coversByDay[dow];
    const trueCovers = Math.max(1, usual * (1 + TRUE_WORLD.coversDrift * drift));
    const demand = (c: number) => Math.max(0.3, 1 + (1 - c / usual) * H.coversSlope);

    const trueUsual: Record<string, number> = {};
    const trueMean: Record<string, number> = {};
    const trueMeanAtPrep: Record<string, number> = {};
    ingredients.forEach((ing, k) => {
      const bias = H.ingredientBias[ing.id] ?? hashBias(ing.id);
      const prep = usualPrepKg(ing.baselinePrepKg, usual, kitchen.avgCovers);
      const atPrep =
        prep *
        TRUE_WORLD.baseFraction *
        H.weather[condition] *
        H.weekday[dow] *
        TRUE_WORLD.season[d.getMonth()] *
        (event.type === "none" ? 1 : TRUE_WORLD.event) *
        TRUE_WORLD.shelfLife(ing.shelfLifeDays) *
        bias;
      const mean = Math.min(prep * 0.6, atPrep * demand(trueCovers));
      const s = TRUE_WORLD.noiseSigma;
      trueMean[ing.id] = mean;
      trueMeanAtPrep[ing.id] = Math.min(prep * 0.6, atPrep); // demand(usual) = 1
      trueUsual[ing.id] = mean * Math.exp(s * noise[k] - (s * s) / 2);
    });

    days.push({
      date: localISO(d),
      dateObj: d,
      weather: { date: localISO(d), tempF, condition, precipProb: rainy ? 75 : 10, description: describe(condition, tempF) },
      realWeather: !!real,
      usualCovers: usual,
      expectedCovers: usual,
      actualCovers: Math.round(trueCovers),
      event,
      trueUsual,
      trueMean,
      trueMeanAtPrep,
    });
  }
  return days;
}
