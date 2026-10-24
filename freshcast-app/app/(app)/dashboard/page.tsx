"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, Database, Leaf, Radio, Sparkles, Sprout } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { WeeklyBin, weeklyBin } from "@/components/charts/weekly-bin";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { ScenarioBar } from "@/components/dashboard/scenario-bar";
import { IngredientBars } from "@/components/dashboard/ingredient-bars";
import { SignalBreakdown } from "@/components/dashboard/signal-breakdown";
import { ImpactCard } from "@/components/dashboard/impact-card";
import { Guide } from "@/components/dashboard/guide";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { parseLocalDate } from "@/lib/demo-data";
import { dailyTotals, summarize } from "@/lib/history";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { selected, weatherSource, ingredients, observations, dbStatus, profile, scenario, hydrated } = useStore();
  const [applied, setApplied] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const totals = useMemo(() => dailyTotals(observations, ingredients), [observations, ingredients]);
  const sum = useMemo(() => summarize(totals, profile.openDays.filter(Boolean).length), [totals, profile.openDays]);
  const weeks = useMemo(() => weeklyBin(totals), [totals]);
  const before = weeks.filter((w) => !w.onPlan);
  const after = weeks.filter((w) => w.onPlan).slice(-2);
  const avgOf = (xs: typeof weeks) => (xs.length ? xs.reduce((s, w) => s + w.cost, 0) / xs.length : null);
  const beforeWk = before.length ? avgOf(before) : null;
  const nowWk = after.length ? avgOf(after) : null;

  const focus = selected?.ingredients.find((i) => i.ingredient.id === focusId) ?? selected?.ingredients[0];
  const dateLabel = selected
    ? parseLocalDate(selected.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";
  // One definition of "saved" everywhere: food the plan didn't prep on nights
  // where that is provable (see lib/history.ts), annualized from the last 30 days.
  const yearly = (sum.savedLast30 * 365) / 30;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">Prep forecast</p>
          <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">{dateLabel || "Loading forecast"}</h1>
        </div>
        <span className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary">
          <Database className={cn("h-3.5 w-3.5", dbStatus === "connected" ? "text-good" : dbStatus === "sandbox" ? "text-data" : "text-caution")} />
          {dbStatus === "connected" ? `Supabase, ${observations.length} close-outs` : dbStatus === "sandbox" ? `Demo sandbox, ${observations.length} close-outs` : dbStatus === "loading" ? "Connecting" : "Offline copy"}
          <span className="text-border">|</span>
          <Radio className={cn("h-3.5 w-3.5", weatherSource === "live" ? "text-good" : "text-caution")} />
          {weatherSource === "live" ? "Live weather from Open-Meteo" : weatherSource === "loading" ? "Fetching weather" : "Offline, seasonal weather"}
        </span>
      </header>

      <Guide
        state={{
          pickedDay: scenario.selectedDate !== null,
          openedItem: focusId !== null,
          triedWhatIf: scenario.coversOverride !== null || scenario.weatherOverride !== "live" || scenario.event !== "none",
          applied,
        }}
      />

      {hydrated && observations.length === 0 && ingredients.length > 0 && (
        <Card className="flex flex-wrap items-center gap-4 border-data/40">
          <Sprout className="h-6 w-6 shrink-0 text-data" aria-hidden />
          <div className="min-w-[260px] flex-1">
            <p className="font-display text-base font-600 text-text-primary">Day 1 for {profile.name}</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Forecasts come from the priors (usual prep, weather, season, shelf life) until you close out a few nights, so the ranges are wide on purpose. Night 3 starts scoring; by night 14 it has learned your kitchen.
            </p>
          </div>
          <Link href="/log" className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim">
            Close out tonight <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Card>
      )}

      <WeekStrip />
      <ScenarioBar />

      {selected && focus && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardLabel>Waste at risk</CardLabel>
              <p className={cn("mt-2 font-display text-[44px] font-700 leading-none tracking-tight tabular-nums", applied ? "text-good" : "text-waste")}>
                <Counter value={applied ? selected.totalReducedCost : selected.totalWasteCost} prefix="$" />
              </p>
              <p className="mt-2 text-xs text-text-muted">
                {applied ? "With FreshCast prep plan" : "If you prep like a normal day"}
                {!applied && selected.totalLow !== undefined && selected.totalHigh !== undefined && `, likely ${formatCurrency(selected.totalLow)}–${formatCurrency(selected.totalHigh)}`}
              </p>
            </Card>
            <Card>
              <CardLabel>Plan saves you</CardLabel>
              <p className="mt-2 font-display text-[44px] font-700 leading-none tracking-tight tabular-nums text-good">
                <Counter value={selected.totalSavings} prefix="$" />
              </p>
              <p className="mt-2 text-xs text-text-muted">
                and {selected.totalCo2Prevented.toFixed(1)}kg CO₂e on this service
              </p>
            </Card>
            <Card>
              <CardLabel>Saved, last 30 days</CardLabel>
              <p className="mt-2 font-display text-[44px] font-700 leading-none tracking-tight tabular-nums text-text-primary">
                <Counter value={sum.savedLast30} prefix="$" />
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <Leaf className="h-3 w-3 text-good" /> {Math.round(sum.co2Last30)}kg CO₂e, about {Math.round(sum.co2Last30 / 0.4).toLocaleString()} miles of driving
              </p>
            </Card>
          </div>


          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
            <Card>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <h2 className="font-display text-lg font-600 text-text-primary">Food thrown out each week</h2>
          {beforeWk !== null && nowWk !== null ? (
            <>
              <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs text-text-muted">Before FreshCast</p>
                  <p className="font-display text-3xl font-700 tabular-nums text-waste">{formatCurrency(beforeWk)}<span className="text-base font-500 text-text-muted"> a week</span></p>
                </div>
                <ArrowDown className="mb-2 h-5 w-5 -rotate-90 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Last 2 weeks, prepping to plan</p>
                  <p className="font-display text-3xl font-700 tabular-nums text-good">{formatCurrency(nowWk)}<span className="text-base font-500 text-text-muted"> a week</span></p>
                </div>
                <p className="mb-1 rounded-md border border-good/40 px-2 py-0.5 text-sm font-600 tabular-nums text-good">{Math.round((1 - nowWk / beforeWk) * 100)}% less</p>
              </div>
              <div className="mt-5">
                <WeeklyBin weeks={weeks} />
              </div>
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-waste" /> Prepping as usual</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-good" /> Prepping to the FreshCast plan</span>
                <span>Dollars of food that went in the bin, from {sum.daysLogged} nightly close-outs.</span>
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Close out a few weeks of service and the before and after shows up here.</p>
          )}
        </Card>
        <Card className="flex flex-col">
          <CardLabel>Kept out of the bin</CardLabel>
          <p className="mt-3 font-display text-[44px] font-700 leading-none tabular-nums text-good">
            <Counter value={Math.round(yearly)} prefix="$" />
          </p>
          <p className="mt-2 text-sm text-text-secondary">a year, at the last 30 days&apos; rate</p>
          <div className="mt-auto space-y-2 border-t border-border pt-4 text-sm">
            <p className="flex justify-between gap-3"><span className="text-text-muted">Last 30 days</span><span className="font-600 tabular-nums text-text-primary">{formatCurrency(sum.savedLast30)}</span></p>
            <p className="flex justify-between gap-3"><span className="text-text-muted">Food not bought</span><span className="font-600 tabular-nums text-text-primary">{Math.round(sum.kgLast30)} kg</span></p>
            <p className="text-xs leading-relaxed text-text-muted">Counts only nights where the cut was provably waste, not nights an item sold out.</p>
          </div>
        </Card>
      </div>
      {sum.daysLogged > 0 && <ImpactCard sum={sum} />}
    </div>
  );
}
