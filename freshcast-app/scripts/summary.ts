import { runBacktest } from "../lib/backtest";
import { DEMO_INGREDIENTS } from "../lib/demo-data";
import { dailyTotals, summarize } from "../lib/history";
const bt = runBacktest(DEMO_INGREDIENTS, 12, 7, new Date(), 14);
const t = dailyTotals(bt.closeouts, DEMO_INGREDIENTS);
console.log(summarize(t));
console.log("rows", bt.closeouts.length, "first", t[0].date, "last", t[t.length-1].date);
console.log(t.slice(10,18).map(x=>`${x.date} $${x.wasteCost.toFixed(0)} saved $${x.savedCost.toFixed(0)}`).join("\n"));
