// Simulated kitchen used for (1) seeding Marco's demo history and (2) the
// accuracy backtest. The "true world" below is hidden from the model: its
// priors in prediction.ts are deliberately different, and the learning layer
// has to discover the gap from waste logs alone.

import { DayWeather, Ingredient, NearbyEvent, WeatherCondition } from "./types";
import { AVG_COVERS, COVERS_BY_DAY, EVENTS, localISO } from "./demo-data";
import { describe } from "./weather";

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

export const TRUE_WORLD = {
  baseFraction: 0.08,
  coversSlope: 0.8, // model assumes 0.6
  weather: { rain: 1.25, storm: 1.3, hot: 0.88, cold: 1.12, normal: 1.0 } as Record<WeatherCondition, number>, // model: rain 1.15
  dayOfWeek: [0.95, 1.3, 1.12, 1.0, 0.97, 0.85, 0.8], // model: [0.9, 1.22, 1.18, 1.05, 1.0, 0.88, 0.82]
  season: [1.1, 1.1, 1.0, 1.0, 0.95, 0.95, 0.9, 0.9, 1.08, 1.08, 1.15, 1.15],
  event: 0.75,
  noiseSigma: 0.12, // day-to-day randomness no model can predict
  // Marco's habits: he over-preps basil and arugula, under-preps tomatoes.
  ingredientBias: { arugula: 1.3, salmon: 0.85, mozzarella: 1.05, tomatoes: 0.8, basil: 1.4, pasta: 1.15, prosciutto: 0.95, focaccia: 1.25 } as Record<string, number>,
};

// Boston average daily high by month (°F)
const MONTH_HIGH = [36, 39, 46, 57, 67, 77, 82, 80, 73, 62, 51, 41];

export interface SimDay {
  date: string;
  dateObj: Date;
  weather: DayWeather;
  expectedCovers: number; // what reservations said
  event: NearbyEvent;
  trueUsual: Record<string, number>; // waste if prepped as usual (kg), with noise
  trueMean: Record<string, number>; // same, without noise: the best any model could do
}

function hashBias(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return 0.8 + ((Math.abs(h) % 1000) / 1000) * 0.5;
}

export function simulateDays(ingredients: Ingredient[], start: Date, numDays: number, seed: number): SimDay[] {
  const r = rng(seed);
  const days: SimDay[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dow = d.getDay();
    const tempF = MONTH_HIGH[d.getMonth()] + gauss(r) * 6;
    const wet = r() < 0.3;
    const condition: WeatherCondition = wet ? (r() < 0.12 ? "storm" : "rain") : tempF >= 85 ? "hot" : tempF <= 32 ? "cold" : "normal";
    const event = !wet && r() < 0.08 ? EVENTS.game : EVENTS.none;
    const expectedCovers = Math.max(10, Math.round(COVERS_BY_DAY[dow] * (1 + 0.12 * gauss(r))));
    const trueCovers = expectedCovers * (1 + 0.06 * gauss(r));

    const trueUsual: Record<string, number> = {};
    const trueMean: Record<string, number> = {};
    for (const ing of ingredients) {
      const bias = TRUE_WORLD.ingredientBias[ing.id] ?? hashBias(ing.id);
      const mean =
        ing.baselinePrepKg *
        TRUE_WORLD.baseFraction *
        Math.max(0.3, 1 + (1 - trueCovers / AVG_COVERS) * TRUE_WORLD.coversSlope) *
        TRUE_WORLD.weather[condition] *
        TRUE_WORLD.dayOfWeek[dow] *
        TRUE_WORLD.season[d.getMonth()] *
        (event.type === "none" ? 1 : TRUE_WORLD.event) *
        bias;
      const s = TRUE_WORLD.noiseSigma;
      trueMean[ing.id] = mean;
      trueUsual[ing.id] = mean * Math.exp(s * gauss(r) - (s * s) / 2);
    }

    days.push({
      date: localISO(d),
      dateObj: d,
      weather: { date: localISO(d), tempF, condition, precipProb: wet ? 75 : 10, description: describe(condition, tempF) },
      expectedCovers,
      event,
      trueUsual,
      trueMean,
    });
  }
  return days;
}
