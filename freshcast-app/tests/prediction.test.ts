import { describe, it, expect } from "vitest";
import { computeSignals, predictIngredientWaste, priorWasteKg, BASE_WASTE_FRACTION, REDUCTION_RATE } from "@/lib/prediction";
import { NO_LEARNING } from "@/lib/learning";
import { Ingredient, PredictionInput } from "@/lib/types";

const salmon: Ingredient = { id: "salmon", name: "Salmon", category: "seafood", costPerKg: 28, baselinePrepKg: 6, shelfLifeDays: 2, co2PerKg: 11.9 };

// A Thursday in April: weekday 1.0, season 1.0, no holiday, dry, no event, average guests.
const neutral = (over: Partial<PredictionInput> = {}): PredictionInput => ({
  ingredient: salmon,
  expectedCovers: 52,
  avgCovers: 52,
  weather: { date: "2026-04-16", tempF: 60, condition: "normal", precipProb: 0, description: "Dry, 60°F" },
  weatherSource: "live",
  date: new Date(2026, 3, 16),
  event: { type: "none", name: "", distanceMiles: 0 },
  cuisineType: "italian",
  ...over,
});

describe("prediction engine", () => {
  it("returns exactly nine signals, each with a source", () => {
    const s = computeSignals(neutral());
    expect(s).toHaveLength(9);
    s.forEach((x) => expect(x.source.length).toBeGreaterThan(0));
  });

  it("on a fully neutral day, forecast equals prep x base fraction", () => {
    expect(priorWasteKg(neutral())).toBeCloseTo(salmon.baselinePrepKg * BASE_WASTE_FRACTION, 6);
  });

  it("rain raises the forecast by the weather multiplier", () => {
    const dry = priorWasteKg(neutral());
    const wet = priorWasteKg(neutral({ weather: { ...neutral().weather, condition: "rain", description: "Rain" } }));
    expect(wet / dry).toBeCloseTo(1.15, 3);
  });

  it("fewer guests than average means more waste, more guests means less", () => {
    const base = priorWasteKg(neutral());
    expect(priorWasteKg(neutral({ expectedCovers: 30 }))).toBeGreaterThan(base);
    expect(priorWasteKg(neutral({ expectedCovers: 80 }))).toBeLessThan(base);
  });

  it("never forecasts negative waste, even on a packed night", () => {
    expect(priorWasteKg(neutral({ expectedCovers: 1000 }))).toBeGreaterThan(0);
  });

  it("the prep plan cuts the forecast by the reduction rate and keeps a buffer", () => {
    const p = predictIngredientWaste({ ...neutral(), learned: NO_LEARNING });
    expect(p.reducedWasteKg / p.predictedWasteKg).toBeCloseTo(1 - REDUCTION_RATE, 1);
    expect(p.recommendedPrepKg).toBeLessThan(salmon.baselinePrepKg);
    expect(p.recommendedPrepKg).toBeGreaterThan(0);
  });

  it("regression (found by PBT P4): tiny items never get more than usual prep", () => {
    const tiny = { ...salmon, baselinePrepKg: 0.10551996228669307, costPerKg: 0.5 };
    const p = predictIngredientWaste({ ...neutral({ ingredient: tiny, expectedCovers: 109 }), learned: { ...NO_LEARNING, calibration: 0.4, days: 10 } });
    expect(p.recommendedPrepKg).toBeLessThanOrEqual(tiny.baselinePrepKg);
  });

  it("learned corrections multiply on top of the priors", () => {
    const base = predictIngredientWaste({ ...neutral(), learned: NO_LEARNING }).predictedWasteKg;
    const learned = predictIngredientWaste({ ...neutral(), learned: { ...NO_LEARNING, calibration: 1.2, days: 20 } }).predictedWasteKg;
    expect(learned / base).toBeCloseTo(1.2, 1);
  });
});
