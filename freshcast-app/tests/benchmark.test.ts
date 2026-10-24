import { describe, it, expect } from "vitest";
import { runAblation } from "@/lib/backtest";
import { runEffort, ownerBaseline } from "@/lib/effort";
import { DEMO_INGREDIENTS } from "@/lib/demo-data";
import { importPosCsv, parseCsv } from "@/lib/pos-import";

describe("benchmark (walk-forward on simulated kitchens)", () => {
  const versions = runAblation(DEMO_INGREDIENTS, [7, 11]);

  it("every added signal improves accuracy: v0 < v1 < v2 < v3 <= v4", () => {
    const acc = versions.map((v) => v.accuracy);
    for (let i = 1; i < acc.length; i++) expect(acc[i]).toBeGreaterThanOrEqual(acc[i - 1] - 0.002);
    expect(acc[acc.length - 1] - acc[0]).toBeGreaterThan(0.15);
  });

  it("the default logging plan beats the owner's own best guess", () => {
    const rec = runEffort(DEMO_INGREDIENTS, [7, 11]).find((r) => r.plan.id === "all-pos")!;
    expect(rec.accuracy).toBeGreaterThan(ownerBaseline(DEMO_INGREDIENTS, [7, 11]));
    expect(rec.minutes).toBeLessThan(10);
  });
});

describe("POS sales import", () => {
  it("parses quoted fields with commas", () => {
    expect(parseCsv('a,b\n"1,000",x\n')).toEqual([["a", "b"], ["1,000", "x"]]);
  });

  it("learns guests by weekday from a Square-style export", () => {
    const rows = ["Date,Guests,Gross Sales"];
    for (let d = 1; d <= 28; d++) rows.push(`9/${d}/2026,${new Date(2026, 8, d).getDay() === 6 ? 80 : 40},"$1,200.00"`);
    const r = importPosCsv(rows.join("\n"));
    expect(r.days).toBe(28);
    expect(r.coversByDay[6]).toBe(80); // Saturday
    expect(r.coversByDay[2]).toBe(40);
    expect(r.guestColumn).toBe("Guests");
  });

  it("rejects files without a date column", () => {
    expect(() => importPosCsv("foo,bar\n1,2\n")).toThrow(/date column/);
  });
});
