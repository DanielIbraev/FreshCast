"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Check, Leaf, Radio, Sparkles } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { WasteTrend } from "@/components/charts/waste-trend";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { ScenarioBar } from "@/components/dashboard/scenario-bar";
import { IngredientBars } from "@/components/dashboard/ingredient-bars";
import { SignalBreakdown } from "@/components/dashboard/signal-breakdown";
import { useStore } from "@/lib/store";
import { DEMO_RUNNING_TOTALS, generateWasteHistory, parseLocalDate } from "@/lib/demo-data";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { selected, weatherSource, ingredients } = useStore();
  const [applied, setApplied] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const history = useMemo(() => generateWasteHistory(), []);

  const focus = selected?.ingredients.find((i) => i.ingredient.id === focusId) ?? selected?.ingredients[0];
  const dateLabel = selected
    ? parseLocalDate(selected.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";
  const yearly = (DEMO_RUNNING_TOTALS.wasteBeforeMonthly - DEMO_RUNNING_TOTALS.wasteAfterMonthly) * 12;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-text-muted">Prep forecast</p>
          <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">{dateLabel || "Loading forecast"}</h1>
        </div>
        <span className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary">
          <Radio className={cn("h-3.5 w-3.5", weatherSource === "live" ? "text-good" : "text-caution")} />
          {weatherSource === "live" ? "Live weather · Open-Meteo" : weatherSource === "loading" ? "Fetching weather" : "Offline · seasonal weather"}
          <span className="text-text-muted">· {ingredients.length} ingredients tracked</span>
        </span>
      </header>

      <WeekStrip />
      <ScenarioBar />

      {selected && focus && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardLabel>Waste at risk</CardLabel>
              <p className={cn("mt-2 font-display text-[44px] font-800 leading-none tracking-tight tabular-nums", applied ? "text-good" : "text-waste")}>
                <Counter value={applied ? selected.totalReducedCost : selected.totalWasteCost} prefix="$" />
              </p>
              <p className="mt-2 text-xs text-text-muted">{applied ? "With FreshCast prep plan" : "If you prep like a normal day"}</p>
            </Card>
            <Card>
              <CardLabel>Plan saves you</CardLabel>
              <p className="mt-2 font-display text-[44px] font-800 leading-none tracking-tight tabular-nums text-good">
                <Counter value={selected.totalSavings} prefix="$" />
              </p>
              <p className="mt-2 text-xs text-text-muted">
                and {selected.totalCo2Prevented.toFixed(1)}kg CO₂ on this service
              </p>
            </Card>
            <Card>
              <CardLabel>Saved this month</CardLabel>
              <p className="mt-2 font-display text-[44px] font-800 leading-none tracking-tight tabular-nums text-text-primary">
                <Counter value={DEMO_RUNNING_TOTALS.savedThisMonth} prefix="$" />
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <Leaf className="h-3 w-3 text-good" /> {DEMO_RUNNING_TOTALS.co2PreventedKg}kg CO₂, about 120 miles not driven
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-[1.45fr_1fr] gap-4">
            <Card>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-600 text-text-primary">Waste forecast by ingredient</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {applied ? "Prep plan applied. Bars show what's left at risk." : "Click any row to see why the model flagged it."}
                  </p>
                </div>
                <button
                  onClick={() => setApplied((v) => !v)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-600 transition-colors duration-150",
                    applied ? "border border-border text-text-secondary hover:text-text-primary" : "bg-good text-canvas hover:bg-good-dim"
                  )}
                >
                  {applied ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  {applied ? "Plan applied" : "Apply prep plan"}
                </button>
              </div>
              <IngredientBars items={selected.ingredients} applied={applied} selectedId={focus.ingredient.id} onSelect={setFocusId} />
            </Card>

            <Card>
              <CardLabel>How the model got there</CardLabel>
              <div className="mt-3">
                <SignalBreakdown item={focus} />
              </div>
            </Card>
          </div>
        </>
      )}

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <h2 className="font-display text-lg font-600 text-text-primary">Daily waste, last 3 weeks</h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">Down 68% since Marco started prepping to the forecast.</p>
          <WasteTrend data={history} />
        </Card>
        <Card className="flex flex-col">
          <CardLabel>Monthly waste</CardLabel>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-text-muted">Before</p>
              <p className="font-display text-3xl font-700 tabular-nums text-waste line-through decoration-2">{formatCurrency(DEMO_RUNNING_TOTALS.wasteBeforeMonthly)}</p>
            </div>
            <ArrowDown className="mb-2 h-5 w-5 -rotate-90 text-text-muted" />
            <div className="text-right">
              <p className="text-xs text-text-muted">Now</p>
              <p className="font-display text-3xl font-700 tabular-nums text-good">{formatCurrency(DEMO_RUNNING_TOTALS.wasteAfterMonthly)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-2.5 w-full rounded-full bg-waste/80" />
            <div className="h-2.5 rounded-full bg-good" style={{ width: `${(DEMO_RUNNING_TOTALS.wasteAfterMonthly / DEMO_RUNNING_TOTALS.wasteBeforeMonthly) * 100}%` }} />
            <p className="text-xs text-text-muted">
              {Math.round((1 - DEMO_RUNNING_TOTALS.wasteAfterMonthly / DEMO_RUNNING_TOTALS.wasteBeforeMonthly) * 100)}% less food in the bin each month
            </p>
          </div>
          <div className="mt-auto border-t border-border pt-4">
            <p className="text-xs text-text-muted">Kept per year</p>
            <p className="font-display text-[40px] font-800 leading-none tabular-nums text-good">{formatCurrency(yearly)}</p>
            <p className="mt-2 text-xs text-text-muted">FreshCast costs $588/year. That&apos;s a 30x return.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
