// Regenerates lib/benchmarks.json. Run after any model change: npm run bench
// Top-level numbers are Marco's Trattoria (the pitch numbers); byRestaurant
// has the same study for each demo kitchen.
import { writeFileSync } from "fs";
import { runAblation, runBacktest, coverage } from "../lib/backtest";
import { runEffort, ownerBaseline } from "../lib/effort";
import { DEMO_PROFILES } from "../lib/profile";
import { KITCHENS, shapeOf } from "../lib/kitchens";

const SEEDS = [7, 11, 23, 31, 42];

function study(id: string, withEffort: boolean) {
  const p = DEMO_PROFILES.find((x) => x.id === id)!;
  const ing = KITCHENS[id].ingredients;
  const k = shapeOf(p);
  // Oracle ceiling averaged over the same seeds, after the 2-week warm-up.
  const ceilings = SEEDS.map((s) => {
    const w = runBacktest(ing, 12, s, new Date(), 0, k).weeks.slice(2);
    return w.reduce((a, x) => a + x.ceiling, 0) / w.length;
  });
  return {
    versions: runAblation(ing, SEEDS, 12, k),
    weeks: runBacktest(ing, 12, 7, new Date(), 0, k).weeks,
    ceiling: ceilings.reduce((a, x) => a + x, 0) / ceilings.length,
    owner: ownerBaseline(ing, SEEDS, 12, k),
    coverage80: coverage(ing, SEEDS, 12, k),
    effort: withEffort ? runEffort(ing, SEEDS, 12, k).map((r) => ({ id: r.plan.id, name: r.plan.name, accuracy: r.accuracy, minutes: r.minutes })) : [],
  };
}

const marco = study("marcos-trattoria", true);
const byRestaurant = Object.fromEntries(DEMO_PROFILES.map((p) => [p.id, p.id === "marcos-trattoria" ? marco : study(p.id, true)]));
const out = { generatedAt: new Date().toISOString(), seeds: SEEDS, ...marco, byRestaurant };
writeFileSync("lib/benchmarks.json", JSON.stringify(out, null, 2));
for (const [id, s] of Object.entries(byRestaurant)) {
  console.log(
    id.padEnd(18),
    s.versions.map((v) => `${v.id} ${(v.accuracy * 100).toFixed(1)}%`).join("  "),
    "| owner",
    (s.owner * 100).toFixed(1),
    "| oracle",
    (s.ceiling * 100).toFixed(1),
    "| 80% cover",
    (s.coverage80 * 100).toFixed(1),
    "| all+guests",
    ((s.effort.find((e) => e.id === "all-pos")?.accuracy ?? 0) * 100).toFixed(1)
  );
}
