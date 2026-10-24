import { DEMO_PROFILES } from "./lib/profile";
import { KITCHENS, shapeOf } from "./lib/kitchens";
import { runBacktest } from "./lib/backtest";
import { dailyTotals, summarize } from "./lib/history";

for (const p of DEMO_PROFILES) {
  const ings = KITCHENS[p.id].ingredients;
  const obs = runBacktest(ings, 12, 7, new Date(), 14, shapeOf(p)).closeouts;
  const s = summarize(dailyTotals(obs, ings), p.openDays.filter(Boolean).length);
  const yearly = (s.savedLast30 * 365) / 30;
  const kg = (s.kgLast30 * 365) / 30;
  const meals = (kg * 2.2046) / 1.2;
  const t = (s.co2Last30 * 365) / 30 / 1000;
  console.log(p.id, {
    before: s.monthlyBefore?.toFixed(0), now: s.monthlyNow?.toFixed(0), saved30: s.savedLast30.toFixed(0),
    yearly: yearly.toFixed(0), kg: kg.toFixed(0), meals: meals.toFixed(0), t: t.toFixed(2),
    scaleT: (t * 4125).toFixed(0), scaleMeals: (meals * 4125 / 1e6).toFixed(2) + "M", cars: ((t * 4125) / 4.6).toFixed(0),
  });
}
