"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Check, Database, Leaf, Radio, Sparkles } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { WasteTrend } from "@/components/charts/waste-trend";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { ScenarioBar } from "@/components/dashboard/scenario-bar";
import { IngredientBars } from "@/components/dashboard/ingredient-bars";
import { SignalBreakdown } from "@/components/dashboard/signal-breakdown";
import { useStore } from "@/lib/store";
import { parseLocalDate } from "@/lib/demo-data";
import { dailyTotals, summarize } from "@/lib/history";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { selected, weatherSource, ingredients, observations, dbStatus } = useStore();
  const [applied, setApplied] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const totals = useMemo(() => dailyTotals(observations, ingredients), [observations, ingredients]);
  const sum = useMemo(() => summarize(totals), [totals]);
  const trend = totals.slice(-56).map((t) => ({ date: t.date, wasteCost: Math.round(t.wasteCost) }));
  const drop = sum.monthlyBefore && sum.monthlyNow ? Math.round((1 - sum.monthlyNow / sum.monthlyBefore) * 100) : null;

  const focus = selected?.ingredients.find((i) => i.ingredient.id === focusId) ?? selected?.ingredients[0];
  const dateLabel = selected
    ? parseLocalDate(selected.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";
  const yearly = sum.monthlyBefore && sum.monthlyNow ? (sum.monthlyBefore - sum.monthlyNow) * 12 : 0;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-text-muted">Prep forecast</p>
          <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">{dateLabel || "Loading forecast"}</h1>
        </div>
        <span className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary">
          <Database className={cn("h-3.5 w-3.5", dbStatus === "connected" ? "text-good" : "text-caution")} />
          {dbStatus === "connected" ? `Supabase · ${observations.length} close-outs` : dbStatus === "loading" ? "Connecting" : "Offline copy"}
          <span className="text-border">|</span>
          <Radio className={cn("h-3.5 w-3.5", weatherSource === "live" ? "text-good" : "text-caution")} />
          {weatherSource === "live" ? "Live weather · Open-Meteo" : weatherSource === "loading" ? "Fetching weather" : "Offline · seasonal weather"}
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
              <CardLabel>Saved, last 30 days</CardLabel>
              <p className="mt-2 font-display text-[44px] font-800 leading-none tracking-tight tabular-nums text-text-primary">
                <Counter value={sum.savedLast30} prefix="$" />
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <Leaf className="h-3 w-3 text-good" /> {Math.round(sum.co2Last30)}kg CO₂, about {Math.round(sum.co2Last30 / 0.4).toLocaleString()} miles not driven
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
          <h2 className="font-display text-lg font-600 text-text-primary">What actually went in the bin</h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">
            Last 8 weeks of nightly close-outs{drop !== null ? `. Down ${drop}% since Marco started prepping to the plan.` : "."}
          </p>
          <WasteTrend data={trend} adoptionDate={sum.planStart} />
        </Card>
        <Card className="flex flex-col">
          <CardLabel>Monthly waste</CardLabel>
          {sum.monthlyBefore && sum.monthlyNow ? (
            <>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-text-muted">Before the plan</p>
                  <p className="font-display text-3xl font-700 tabular-nums text-waste line-through decoration-2">{formatCurrency(sum.monthlyBefore)}</p>
                </div>
                <ArrowDown className="mb-2 h-5 w-5 -rotate-90 text-text-muted" />
                <div className="text-right">
                  <p className="text-xs text-text-muted">Last 14 days</p>
                  <p className="font-display text-3xl font-700 tabular-nums text-good">{formatCurrency(sum.monthlyNow)}</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-2.5 w-full rounded-full bg-waste/80" />
                <div className="h-2.5 rounded-full bg-good" style={{ width: `${(sum.monthlyNow / sum.monthlyBefore) * 100}%` }} />
                <p className="text-xs text-text-muted">{drop}% less food in the bin, from {sum.daysLogged} days of logs</p>
              </div>
              <div className="mt-auto border-t border-border pt-4">
                <p className="text-xs text-text-muted">Kept per year at this rate</p>
                <p className="font-display text-[40px] font-800 leading-none tabular-nums text-good">{formatCurrency(yearly)}</p>
                <p className="mt-2 text-xs text-text-muted">FreshCast costs $588/year. That&apos;s a {Math.round(yearly / 588)}x return.</p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-text-muted">Log waste for a week to see your before and after.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
