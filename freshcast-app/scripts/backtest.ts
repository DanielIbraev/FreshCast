import { runBacktest, runAblation } from "../lib/backtest";
import { DEMO_INGREDIENTS } from "../lib/demo-data";
for (const v of runAblation(DEMO_INGREDIENTS)) console.log(`${v.id} ${v.name.padEnd(30)} ${(v.accuracy*100).toFixed(1)}%`);
const r = runBacktest(DEMO_INGREDIENTS, 12, 7);
const c = r.weeks.slice(2).reduce((s,w)=>s+w.ceiling,0)/10;
console.log(`ceiling (wk3-12, seed 7): ${(c*100).toFixed(1)}%`);
