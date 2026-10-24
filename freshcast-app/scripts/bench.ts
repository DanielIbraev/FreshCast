// Regenerates lib/benchmarks.json. Run after any model change: npm run bench
import { writeFileSync } from "fs";
import { runAblation, runBacktest } from "../lib/backtest";
import { runEffort, ownerBaseline } from "../lib/effort";
import { DEMO_INGREDIENTS } from "../lib/demo-data";

const weeks = runBacktest(DEMO_INGREDIENTS, 12, 7).weeks;
const out = {
  generatedAt: new Date().toISOString(),
  versions: runAblation(DEMO_INGREDIENTS),
  weeks,
  ceiling: weeks.slice(2).reduce((s, w) => s + w.ceiling, 0) / (weeks.length - 2),
  owner: ownerBaseline(DEMO_INGREDIENTS),
  effort: runEffort(DEMO_INGREDIENTS).map((r) => ({ id: r.plan.id, name: r.plan.name, accuracy: r.accuracy, minutes: r.minutes })),
};
writeFileSync("lib/benchmarks.json", JSON.stringify(out, null, 2));
console.log(out.versions.map((v) => `${v.id} ${(v.accuracy * 100).toFixed(1)}%`).join("  "), "| ceiling", (out.ceiling * 100).toFixed(1));
