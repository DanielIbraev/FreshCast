// Property-based tests (fast-check). Each property is a requirement stated for
// ALL inputs, checked against hundreds of generated cases. See
// .kiro/specs/forecast-confidence/design.md, "Correctness properties".
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { predictIngredientWaste, priorWasteKg } from "@/lib/prediction";
import { learn, accuracy, NO_LEARNING, Observation } from "@/lib/learning";
import { parseCsv, importPosCsv } from "@/lib/pos-import";
import { range } from "@/lib/uncertainty";
import { Category, CuisineType, Ingredient, PredictionInput, WeatherCondition } from "@/lib/types";

const RUNS = { numRuns: 200 };

const arbCategory = fc.constantFrom<Category>("produce", "meat", "seafood", "dairy", "bakery", "dry");
const arbCondition = fc.constantFrom<WeatherCondition>("rain", "storm", "hot", "cold", "normal");
const arbCuisine = fc.constantFrom<CuisineType>("italian", "french", "sushi", "seafood", "burger", "fast_casual", "fine_dining");
const arbIngredient = fc.record({
  id: fc.constant("x"),
  name: fc.constant("X"),
  category: arbCategory,
  costPerKg: fc.double({ min: 0.5, max: 200, noNaN: true }),
  baselinePrepKg: fc.double({ min: 0.1, max: 50, noNaN: true }),
  shelfLifeDays: fc.integer({ min: 1, max: 30 }),
  co2PerKg: fc.double({ min: 0, max: 30, noNaN: true }),
}) as fc.Arbitrary<Ingredient>;
const arbDate = fc.date({ min: new Date(2024, 0, 1), max: new Date(2028, 11, 31), noInvalidDate: true });

const input = (ing: Ingredient, covers: number, avg: number, condition: WeatherCondition, date: Date, cuisine: CuisineType): PredictionInput => ({
  ingredient: ing,
  expectedCovers: covers,
  avgCovers: avg,
  weather: { date: "2026-01-01", tempF: 60, condition, precipProb: 0, description: condition },
  weatherSource: "live",
  date,
  event: { type: "none", name: "", distanceMiles: 0 },
  cuisineType: cuisine,
});

describe("P1-P4: prediction engine", () => {
  it("P1: forecast is always finite and non-negative", () => {
    fc.assert(
      fc.property(arbIngredient, fc.integer({ min: 0, max: 2000 }), fc.integer({ min: 1, max: 500 }), arbCondition, arbDate, arbCuisine, (ing, c, avg, w, d, cu) => {
        const v = priorWasteKg(input(ing, c, avg, w, d, cu));
        return Number.isFinite(v) && v >= 0;
      }),
      RUNS
    );
  });

  it("P2: more guests never means more forecast waste", () => {
    fc.assert(
      fc.property(arbIngredient, fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1, max: 300 }), arbCondition, arbDate, (ing, a, b, avg, w, d) => {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        return priorWasteKg(input(ing, lo, avg, w, d, "italian")) >= priorWasteKg(input(ing, hi, avg, w, d, "italian")) - 1e-12;
      }),
      RUNS
    );
  });

  it("P3: forecast is linear in daily prep", () => {
    fc.assert(
      fc.property(arbIngredient, fc.integer({ min: 0, max: 500 }), arbCondition, arbDate, (ing, c, w, d) => {
        const one = priorWasteKg(input(ing, c, 50, w, d, "italian"));
        const two = priorWasteKg(input({ ...ing, baselinePrepKg: ing.baselinePrepKg * 2 }, c, 50, w, d, "italian"));
        return Math.abs(two - 2 * one) <= 1e-9 * Math.max(1, two);
      }),
      RUNS
    );
  });

  it("P4: the prep plan never asks for negative prep or more than usual", () => {
    fc.assert(
      fc.property(arbIngredient, fc.integer({ min: 0, max: 2000 }), arbCondition, arbDate, fc.double({ min: 0.4, max: 2.5, noNaN: true }), (ing, c, w, d, cal) => {
        const p = predictIngredientWaste({ ...input(ing, c, 50, w, d, "italian"), learned: { ...NO_LEARNING, calibration: cal, days: 10 } });
        return p.recommendedPrepKg >= 0 && p.recommendedPrepKg <= ing.baselinePrepKg + 1e-9 && p.reducedWasteKg <= p.predictedWasteKg + 1e-9;
      }),
      RUNS
    );
  });
});

// Observations within a 60-day window before a fixed target date.
const TARGET = "2026-06-30";
const dayStr = (n: number) => new Date(Date.UTC(2026, 4, 1 + n)).toISOString().slice(0, 10); // May 1 + n
const arbObs = fc.array(
  fc.record({
    day: fc.integer({ min: 0, max: 59 }),
    id: fc.constantFrom("a", "b", "c"),
    ratio: fc.double({ min: 0.05, max: 20, noNaN: true }),
    condition: fc.constantFrom("rain", "normal", "hot"),
  }),
  { maxLength: 120 }
).map((xs) => xs.map((x): Observation => ({ date: dayStr(x.day), ingredientId: x.id, rawKg: 1, usualKg: x.ratio, condition: x.condition })));

describe("P5-P7: learning layer", () => {
  it("P5: learned factors always stay inside their clamps", () => {
    fc.assert(
      fc.property(arbObs, fc.constantFrom("a", "b", "z"), fc.constantFrom("rain", "normal"), (obs, id, cond) => {
        const L = learn(obs, id, TARGET, cond);
        return L.calibration >= 0.4 && L.calibration <= 2.5 && L.weekday >= 0.6 && L.weekday <= 1.6 && L.weather >= 0.6 && L.weather <= 1.6 && L.recency >= 0.75 && L.recency <= 1.3;
      }),
      RUNS
    );
  });

  it("P6: observations from the target day or later never change the forecast (no leakage)", () => {
    const arbFuture = fc.array(fc.record({ d: fc.integer({ min: 0, max: 10 }), r: fc.double({ min: 0.05, max: 20, noNaN: true }) }), { minLength: 1, maxLength: 20 });
    fc.assert(
      fc.property(arbObs, arbFuture, (obs, fut) => {
        const future: Observation[] = fut.map((f) => ({ date: new Date(Date.UTC(2026, 5, 30 + f.d)).toISOString().slice(0, 10), ingredientId: "a", rawKg: 1, usualKg: f.r, condition: "normal" }));
        return JSON.stringify(learn(obs, "a", TARGET, "normal")) === JSON.stringify(learn([...obs, ...future], "a", TARGET, "normal"));
      }),
      RUNS
    );
  });

  it("P7: calibration sits between 1.0 and the kitchen's mean ratio (shrinkage)", () => {
    fc.assert(
      fc.property(fc.array(fc.double({ min: 0.5, max: 2.4, noNaN: true }), { minLength: 1, maxLength: 28 }), (ratios) => {
        const obs: Observation[] = ratios.map((r, i) => ({ date: new Date(Date.UTC(2026, 5, 29 - i)).toISOString().slice(0, 10), ingredientId: "a", rawKg: 1, usualKg: r, condition: "normal" }));
        const mean = ratios.reduce((s, x) => s + x, 0) / ratios.length;
        const c = learn(obs, "a", TARGET).calibration;
        return c >= Math.min(1, mean) - 1e-9 && c <= Math.max(1, mean) + 1e-9;
      }),
      RUNS
    );
  });
});

describe("P8: confidence range", () => {
  it("0 <= low <= forecast <= high, for any forecast and any error history", () => {
    const res = fc.array(fc.double({ min: -3, max: 3, noNaN: true }), { maxLength: 40 });
    fc.assert(
      fc.property(fc.double({ min: 0, max: 500, noNaN: true }), res, res, (f, own, pooled) => {
        const r = range(f, own, pooled);
        return r.low >= 0 && r.low <= f + 1e-9 && f <= r.high + 1e-9 && Number.isFinite(r.high);
      }),
      RUNS
    );
  });
});

describe("P9: accuracy metric", () => {
  it("is in [0, 1], and exactly 1 when every forecast is right", () => {
    const pair = fc.record({ predicted: fc.double({ min: 0, max: 100, noNaN: true }), actual: fc.double({ min: 0.001, max: 100, noNaN: true }) });
    fc.assert(
      fc.property(fc.array(pair, { minLength: 1, maxLength: 50 }), (pairs) => {
        const a = accuracy(pairs);
        const perfect = accuracy(pairs.map((p) => ({ predicted: p.actual, actual: p.actual })));
        return a >= 0 && a <= 1 && perfect === 1;
      }),
      RUNS
    );
  });
});

describe("P10-P11: sales export importer", () => {
  const quote = (f: string) => (/[",\r\n]/.test(f) ? `"${f.replace(/"/g, '""')}"` : f);

  it("P10: any table survives CSV write and parse", () => {
    const field = fc.string({ unit: fc.constantFrom("a", "b", "1", " ", ",", '"', "\n", "é", "$"), maxLength: 8 });
    const table = fc.integer({ min: 1, max: 5 }).chain((w) => fc.array(fc.array(field, { minLength: w, maxLength: w }), { minLength: 1, maxLength: 10 }));
    fc.assert(
      fc.property(table, (rows) => {
        // Blank lines are skipped by design, so rows of only whitespace aren't expected back.
        const expected = rows.filter((r) => r.some((f) => f.trim() !== ""));
        const text = rows.map((r) => r.map(quote).join(",")).join("\n");
        return JSON.stringify(parseCsv(text)) === JSON.stringify(expected);
      }),
      RUNS
    );
  });

  it("P11: every date the importer accepts is a real calendar date", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 12 }), fc.integer({ min: 1, max: 31 }), (m, d) => {
        const valid = new Date(2026, m - 1, d).getMonth() === m - 1;
        const rows = ["Date,Guests"];
        for (let i = 1; i <= 14; i++) rows.push(`3/${i}/2026,10`); // 14 known-good days
        rows.push(`${m}/${d}/2026,999`);
        const r = importPosCsv(rows.join("\n"));
        const expectDays = 14 + (valid && !(m === 3 && d <= 14) ? 1 : 0);
        return r.days === expectDays;
      }),
      RUNS
    );
  });
});
