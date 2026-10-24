import { describe, it, expect } from "vitest";
import { learn, accuracy, NO_LEARNING, Observation } from "@/lib/learning";

const day = (n: number) => {
  const d = new Date(Date.UTC(2026, 8, 1 + n));
  return d.toISOString().slice(0, 10);
};
// n nights where the kitchen wasted `ratio` x what the prior expected.
const nights = (n: number, ratio: number, id = "basil", condition = "normal"): Observation[] =>
  Array.from({ length: n }, (_, i) => ({ date: day(i), ingredientId: id, rawKg: 1, usualKg: ratio, condition }));

describe("learning layer", () => {
  it("with no logs, changes nothing", () => {
    expect(learn([], "basil", day(30))).toEqual(NO_LEARNING);
  });

  it("one bad night barely moves calibration (shrinkage)", () => {
    const L = learn(nights(1, 3), "basil", day(1));
    expect(L.calibration).toBeLessThan(1.8);
    expect(L.calibration).toBeGreaterThan(1);
  });

  it("converges toward the kitchen's true ratio with more nights", () => {
    const L = learn(nights(28, 1.4), "basil", day(28));
    expect(L.calibration).toBeGreaterThan(1.3);
    expect(L.calibration).toBeLessThanOrEqual(1.4);
  });

  it("never uses the day it is predicting (no leakage)", () => {
    const obs = [...nights(10, 1), { date: day(10), ingredientId: "basil", rawKg: 1, usualKg: 50, condition: "normal" }];
    expect(learn(obs, "basil", day(10)).calibration).toBeCloseTo(1, 5);
  });

  it("clamps extreme corrections", () => {
    expect(learn(nights(28, 100), "basil", day(28)).calibration).toBeLessThanOrEqual(2.5);
  });

  it("items nobody logs still get the pooled weekday and weather corrections", () => {
    const L = learn(nights(28, 1.3, "salmon"), "basil", day(28));
    expect(L.calibration).toBe(1);
    expect(L.days).toBe(0);
  });
});

describe("accuracy (1 - weighted absolute error)", () => {
  it("is 1 for a perfect forecast", () => {
    expect(accuracy([{ predicted: 2, actual: 2 }, { predicted: 1, actual: 1 }])).toBe(1);
  });
  it("weights by kg, so tiny items can't dominate", () => {
    expect(accuracy([{ predicted: 0.2, actual: 0.1 }, { predicted: 10, actual: 10 }])).toBeCloseTo(1 - 0.1 / 10.1, 6);
  });
  it("is never negative", () => {
    expect(accuracy([{ predicted: 100, actual: 1 }])).toBe(0);
  });
});
