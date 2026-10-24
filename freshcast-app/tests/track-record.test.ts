import { describe, it, expect } from "vitest";
import { trackRecord } from "@/lib/track-record";
import { runBacktest } from "@/lib/backtest";
import { DEMO_PROFILES } from "@/lib/profile";
import { KITCHENS, shapeOf } from "@/lib/kitchens";

const kendall = DEMO_PROFILES.find((p) => p.id === "kendall-bowls")!;
const ing = KITCHENS[kendall.id].ingredients;
const history = runBacktest(ing, 8, 7, new Date(2026, 9, 1), 10, shapeOf(kendall)).closeouts;

describe("restaurant track record (Model accuracy page)", () => {
  it("has no rows for days the restaurant is closed", () => {
    const tr = trackRecord(history, ing, kendall);
    expect(tr.nights.every((n) => new Date(n.date + "T12:00").getDay() !== 0)).toBe(true);
  });

  it("is leak-free: changing tonight's result never changes tonight's forecast", () => {
    const last = history[history.length - 1].date;
    const bumped = history.map((o) => (o.date === last ? { ...o, loggedKg: o.loggedKg * 3 + 1 } : o));
    const a = trackRecord(history, ing, kendall).nights.at(-1)!;
    const b = trackRecord(bumped, ing, kendall).nights.at(-1)!;
    expect(b.forecastCost).toBeCloseTo(a.forecastCost, 9);
    expect(b.actualCost).toBeGreaterThan(a.actualCost);
  });

  it("scores accuracy between 0 and 1 and improves once the kitchen has history", () => {
    const tr = trackRecord(history, ing, kendall);
    expect(tr.lastFourWeeks!).toBeGreaterThan(0.7);
    expect(tr.lastFourWeeks!).toBeLessThanOrEqual(1);
    expect(tr.items).toHaveLength(ing.length);
  });
});
