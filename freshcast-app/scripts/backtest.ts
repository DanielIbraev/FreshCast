import { runBacktest } from "../lib/backtest";
import { DEMO_INGREDIENTS } from "../lib/demo-data";
const seeds = [7, 11, 23];
for (const seed of seeds) {
  const r = runBacktest(DEMO_INGREDIENTS, 12, seed);
  console.log(`seed ${seed}`);
  for (const w of r.weeks) console.log(`  wk${String(w.week).padStart(2)}  naive ${(w.naive*100).toFixed(1)}  prior ${(w.priorOnly*100).toFixed(1)}  learned ${(w.learned*100).toFixed(1)}  ceiling ${(w.ceiling*100).toFixed(1)}`);
}
