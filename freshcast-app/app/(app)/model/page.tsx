"use client";

import { useEffect, useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { VersionLadder } from "@/components/model/version-ladder";
import { LearningCurve } from "@/components/model/learning-curve";
import { useStore } from "@/lib/store";
import { runAblation, runBacktest, VersionResult, WeekResult } from "@/lib/backtest";
import { liveAccuracy } from "@/lib/live-accuracy";
import { toLearningObs } from "@/lib/db";
import { DEMO_INGREDIENTS } from "@/lib/demo-data";

const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);

export default function ModelPage() {
  const { observations, dbStatus } = useStore();
  const [bench, setBench] = useState<{ versions: VersionResult[]; weeks: WeekResult[]; ceiling: number } | null>(null);

  // The benchmark replays 12 weeks x 5 model versions x 3 kitchens. Run it
  // after first paint so the page shell appears instantly.
  useEffect(() => {
    const t = setTimeout(() => {
      const versions = runAblation(DEMO_INGREDIENTS);
      const weeks = runBacktest(DEMO_INGREDIENTS, 12, 7).weeks;
      const ceiling = weeks.slice(2).reduce((s, w) => s + w.ceiling, 0) / (weeks.length - 2);
      setBench({ versions, weeks, ceiling });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const live = useMemo(() => liveAccuracy(toLearningObs(observations)), [observations]);
  const v0 = bench?.versions[0]?.accuracy ?? null;
  const vLast = bench?.versions[bench.versions.length - 1]?.accuracy ?? null;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-text-muted">How we know the forecast is right</p>
        <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Model accuracy</h1>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardLabel>Rule of thumb (v0)</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-waste">{pct(v0)}</p>
          <p className="mt-2 text-xs text-text-muted">Guessing 8% of prep goes in the bin, every day</p>
        </Card>
        <Card>
          <CardLabel>FreshCast today (v4)</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-good">{pct(vLast)}</p>
          <p className="mt-2 text-xs text-text-muted">
            {bench ? `${((1 - vLast!) / (1 - v0!)).toFixed(2)}x the error of guessing, ${(bench.ceiling * 100).toFixed(0)}% is the ceiling` : "Running benchmark"}
          </p>
        </Card>
        <Card>
          <CardLabel>On Marco&apos;s stored logs</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-text-primary">{pct(live.lastFourWeeks)}</p>
          <p className="mt-2 text-xs text-text-muted">
            Last 4 weeks, up from {pct(live.firstTwoWeeks)} in weeks 1-2 · {live.scoredDays} days{dbStatus === "connected" ? " in Supabase" : ""}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-lg font-600 text-text-primary">Every version, same kitchen, same 12 weeks</h2>
        <p className="mt-0.5 text-sm text-text-secondary">Each step adds signals on top of the last. Scored on weeks 3-12, averaged across 3 simulated kitchens.</p>
        <div className="mt-6">{bench ? <VersionLadder versions={bench.versions} ceiling={bench.ceiling} /> : <div className="h-56 animate-pulse rounded bg-canvas" />}</div>
      </Card>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <h2 className="font-display text-lg font-600 text-text-primary">Accuracy week by week</h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">Priors stay flat. The learning layer closes most of the gap within two weeks of logs.</p>
          {bench ? <LearningCurve weeks={bench.weeks} /> : <div className="h-[260px] animate-pulse rounded bg-canvas" />}
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-data" />
            <CardLabel>How this is scored</CardLabel>
          </div>
          <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-text-secondary">
            <li>
              <span className="text-text-primary">Accuracy = 1 − weighted absolute error.</span> Total kg the forecast missed by, divided by total kg actually wasted.
            </li>
            <li>
              <span className="text-text-primary">Walk-forward.</span> Each morning the model only sees logs from earlier days, the same as in a real kitchen.
            </li>
            <li>
              <span className="text-text-primary">Hidden truth.</span> The benchmark kitchen has its own habits (over-prepped basil, a slow Monday, rain that hits harder than average) that the model is never told.
            </li>
            <li>
              <span className="text-text-primary">Why not 100%.</span> About 10% of daily waste is random: a party cancels, a case of greens arrives bruised. No forecast can see that.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
