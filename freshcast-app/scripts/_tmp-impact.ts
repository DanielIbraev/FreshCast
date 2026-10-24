// Throwaway: dollar/impact figures per demo restaurant for the docs. Delete after use.
import { runBacktest } from "../lib/backtest";
import { KITCHENS, shapeOf } from "../lib/kitchens";
import { DEMO_PROFILES } from "../lib/profile";
import { dailyTotals, summarize } from "../lib/history";

for (const p of DEMO_PROFILES) {
  const k = KITCHENS[p.id];
  const bt = runBacktest(k.ingredients, 12, 7, new Date(), 14, shapeOf(p));
  const totals = dailyTotals(bt.closeouts, k.ingredients);
  const open = p.openDays.filter(Boolean).length;
  const s = summarize(totals, open);
  const y = 365 / 30;
  const censored = bt.closeouts.filter((o) => o.loggedKg === 0 && o.cutKg > 0).length;
  console.log(
    JSON.stringify({
      id: p.id,
      openPerWeek: open,
      nights: totals.length,
      planStart: s.planStart,
      monthlyBefore: s.monthlyBefore?.toFixed(0),
      monthlyNow: s.monthlyNow?.toFixed(0),
      cutPct: s.monthlyBefore && s.monthlyNow ? (100 * (1 - s.monthlyNow / s.monthlyBefore)).toFixed(1) : null,
      savedLast30: s.savedLast30.toFixed(0),
      yearly: (s.savedLast30 * y).toFixed(0),
      kgLast30: s.kgLast30.toFixed(1),
      kgYear: (s.kgLast30 * y).toFixed(0),
      co2Last30: s.co2Last30.toFixed(1),
      co2Year: (s.co2Last30 * y).toFixed(0),
      mealsYear: ((s.kgLast30 * y * 2.2046) / 1.2).toFixed(0),
      scaleTonnes: ((s.co2Last30 * y * 4125) / 1000).toFixed(0),
      scaleMealsM: ((s.kgLast30 * y * 2.2046 * 4125) / 1.2 / 1e6).toFixed(2),
      scaleCars: ((s.co2Last30 * y * 4125) / 1000 / 4.6).toFixed(0),
      censoredRows: censored,
      rows: bt.closeouts.length,
    })
  );
}
