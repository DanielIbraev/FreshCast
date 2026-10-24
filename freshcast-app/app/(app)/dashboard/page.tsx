"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CloudRain,
  Users,
  TrendingDown,
  Leaf,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { WasteTrend } from "@/components/charts/waste-trend";
import { buildDayForecast } from "@/lib/forecast";
import {
  DEMO_TOMORROW,
  DEMO_RUNNING_TOTALS,
  generateWasteHistory,
} from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [applied, setApplied] = useState(false);

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

  const history = useMemo(() => generateWasteHistory(), []);

  const maxWaste = Math.max(
    ...forecast.ingredients.map((i) => i.predictedWasteCost)
  );

  const currentTotal = applied
    ? forecast.totalReducedCost
    : forecast.totalWasteCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-text-primary">
            Tomorrow&apos;s Forecast
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Based on 9 live signals. No input needed from you.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2 text-text-secondary">
            <Users className="h-4 w-4 text-data" />
            {forecast.expectedCovers} covers
          </span>
          <span className="flex items-center gap-2 text-text-secondary">
            <CloudRain className="h-4 w-4 text-data" />
            {forecast.weather.description}
          </span>
        </div>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardLabel>Waste at risk tomorrow</CardLabel>
          <p className="mt-2 font-display text-4xl font-800 tracking-tight tabular-nums">
            <Counter
              value={currentTotal}
              prefix="$"
              className={applied ? "text-good" : "text-waste"}
            />
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {applied
              ? "After FreshCast recommendations"
              : "If you prep as usual"}
          </p>
        </Card>

        <Card>
          <CardLabel>Saved this month</CardLabel>
          <p className="mt-2 font-display text-4xl font-800 tracking-tight tabular-nums text-good">
            <Counter value={DEMO_RUNNING_TOTALS.savedThisMonth} prefix="$" />
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-good">
            <TrendingDown className="h-3 w-3" />
            81% less waste than before
          </p>
        </Card>

        <Card>
          <CardLabel>CO₂ prevented</CardLabel>
          <p className="mt-2 font-display text-4xl font-800 tracking-tight tabular-nums text-good">
            <Counter
              value={DEMO_RUNNING_TOTALS.co2PreventedKg}
              suffix="kg"
            />
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <Leaf className="h-3 w-3 text-good" />
            Equal to 193 miles not driven
          </p>
        </Card>
      </div>

      {/* Prediction breakdown — the hero section with red to green */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-600 text-text-primary">
              Predicted waste by ingredient
            </h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              {applied
                ? "Recommendations applied — prep adjusted"
                : "Highest-risk items for tomorrow's service"}
            </p>
          </div>
          <button
            onClick={() => setApplied((v) => !v)}
            className="flex items-center gap-2 rounded-md bg-good px-4 py-2 text-sm font-500 text-canvas transition-colors duration-150 hover:bg-good-dim"
          >
            <Sparkles className="h-4 w-4" />
            {applied ? "Reset forecast" : "Apply recommendations"}
          </button>
        </div>

        <div className="space-y-3">
          {forecast.ingredients.map((item, idx) => {
            const cost = applied
              ? item.reducedWasteCost
              : item.predictedWasteCost;
            const widthPct = (cost / maxWaste) * 100;
            return (
              <div key={item.ingredient.id} className="flex items-center gap-4">
                <span className="w-44 shrink-0 text-sm text-text-secondary">
                  {item.ingredient.name}
                </span>
                <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-canvas">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-md"
                    initial={false}
                    animate={{
                      width: `${Math.max(widthPct, 4)}%`,
                      backgroundColor: applied ? "#10B981" : "#EF4444",
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: idx * 0.04 }}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-500 tabular-nums text-text-primary">
                    {formatCurrency(cost)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top driver explanation */}
        <div className="mt-5 rounded-md border border-border bg-canvas p-4">
          <p className="text-sm text-text-secondary">
            <span className="font-500 text-text-primary">
              Why {forecast.ingredients[0].ingredient.name}?
            </span>{" "}
            {forecast.ingredients[0].recommendation}
          </p>
        </div>
      </Card>

      {/* Trend + savings callout */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <h2 className="mb-1 font-display text-lg font-600 text-text-primary">
            Daily waste, last 3 weeks
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            Waste dropped 68% after Marco started following FreshCast.
          </p>
          <WasteTrend data={history} />
        </Card>

        <Card className="flex flex-col justify-center">
          <CardLabel>Before vs. after FreshCast</CardLabel>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-text-muted">Monthly waste before</p>
              <p className="font-display text-2xl font-700 text-waste tabular-nums">
                {formatCurrency(DEMO_RUNNING_TOTALS.wasteBeforeMonthly)}
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 rotate-90 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Monthly waste now</p>
              <p className="font-display text-2xl font-700 text-good tabular-nums">
                {formatCurrency(DEMO_RUNNING_TOTALS.wasteAfterMonthly)}
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-text-muted">Saved per year</p>
              <p className="font-display text-3xl font-800 text-good tabular-nums">
                {formatCurrency(
                  (DEMO_RUNNING_TOTALS.wasteBeforeMonthly -
                    DEMO_RUNNING_TOTALS.wasteAfterMonthly) *
                    12
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
