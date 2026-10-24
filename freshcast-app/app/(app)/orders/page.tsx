"use client";

import { useMemo } from "react";
import { ShoppingCart, TrendingDown, Check } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { buildDayForecast } from "@/lib/forecast";
import { DEMO_TOMORROW } from "@/lib/demo-data";
import { formatCurrency, formatKg } from "@/lib/utils";

export default function OrdersPage() {
  const forecast = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return buildDayForecast({
      expectedCovers: DEMO_TOMORROW.expectedCovers,
      weather: {
        tempF: DEMO_TOMORROW.tempF,
        condition: DEMO_TOMORROW.weatherCondition,
        description: DEMO_TOMORROW.weatherDescription,
      },
      event: { name: "", type: "none", distanceMiles: 0 },
      date: tomorrow,
    });
  }, []);

  const totalReduction = forecast.ingredients.reduce(
    (s, i) => s + (i.predictedWasteKg - i.reducedWasteKg),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-text-primary">
          Smart Order
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          How much to prep for tomorrow&apos;s {forecast.expectedCovers} covers —
          already adjusted to cut waste.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardLabel>Prep reduction</CardLabel>
          <p className="mt-2 font-display text-4xl font-800 tracking-tight tabular-nums text-good">
            {formatKg(totalReduction)}
          </p>
          <p className="mt-1 text-xs text-text-muted">Less than you&apos;d normally buy</p>
        </Card>
        <Card>
          <CardLabel>Tomorrow&apos;s savings</CardLabel>
          <p className="mt-2 font-display text-4xl font-800 tracking-tight tabular-nums text-good">
            {formatCurrency(forecast.totalSavings)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-good">
            <TrendingDown className="h-3 w-3" />
            vs. prepping as usual
          </p>
        </Card>
        <Card>
          <CardLabel>CO₂ prevented</CardLabel>
          <p className="mt-2 font-display text-4xl font-800 tracking-tight tabular-nums text-good">
            {forecast.totalCo2Prevented.toFixed(1)}kg
          </p>
          <p className="mt-1 text-xs text-text-muted">For a single service</p>
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-600 text-text-primary">
            Recommended prep list
          </h2>
          <button className="flex items-center gap-2 rounded-md border border-good px-4 py-2 text-sm font-500 text-good transition-colors duration-150 hover:bg-good hover:text-canvas">
            <ShoppingCart className="h-4 w-4" />
            Send to supplier
          </button>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-500">Ingredient</th>
                <th className="px-4 py-3 font-500">Usual prep</th>
                <th className="px-4 py-3 font-500">Recommended</th>
                <th className="px-4 py-3 font-500">Why</th>
              </tr>
            </thead>
            <tbody>
              {forecast.ingredients.map((item) => {
                const usual = item.ingredient.baselinePrepKg;
                const recommended =
                  usual - (item.predictedWasteKg - item.reducedWasteKg);
                return (
                  <tr
                    key={item.ingredient.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-500 text-text-primary">
                      {item.ingredient.name}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-text-muted line-through">
                      {formatKg(usual)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 font-500 tabular-nums text-good">
                        <Check className="h-3.5 w-3.5" />
                        {formatKg(recommended)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.primaryDriver}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
