"use client";

import { useMemo } from "react";
import { FlaskConical } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { VersionLadder } from "@/components/model/version-ladder";
import { LearningCurve } from "@/components/model/learning-curve";
import { EffortChart } from "@/components/model/effort-chart";
import { useStore } from "@/lib/store";
import { liveAccuracy } from "@/lib/live-accuracy";
import { toLearningObs } from "@/lib/db";
import bench from "@/lib/benchmarks.json";

const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);

export default function ModelPage() {
  const { observations, dbStatus } = useStore();
  const live = useMemo(() => liveAccuracy(toLearningObs(observations)), [observations]);
  const v0 = bench.versions[0].accuracy;
  const vLast = bench.versions[bench.versions.length - 1].accuracy;
  const none = bench.effort.find((e) => e.id === "none")!;
  const rec = bench.effort.find((e) => e.id === "all-pos")!;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-text-muted">How we know the forecast is right</p>
        <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Model accuracy</h1>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardLabel>Rule of thumb (v0)</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-waste">{pct(v0)}</p>
          <p className="mt-2 text-xs text-text-muted">Guessing 8% of prep goes in the bin, every day</p>
        </Card>
        <Card>
          <CardLabel>FreshCast (v4)</CardLabel>
          <p className="mt-2 font-display text-[44px] font-800 leading-none tabular-nums text-good">{pct(vLast)}</p>
          <p className="mt-2 text-xs text-text-muted">
            Cuts forecast error {Math.round((1 - (1 - vLast) / (1 - v0)) * 100)}% vs. guessing. Best possible is {pct(bench.ceiling)}.
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
        <h2 className="font-display text-lg font-600 text-text-primary">How much staff time is worth it?</h2>
        <p className="mb-5 mt-0.5 text-sm text-text-secondary">
          Each plan replayed on 5 simulated kitchens for 12 weeks. Logging everything with quick-tap estimates takes about {rec.minutes.toFixed(1)} minutes a night
          and lifts accuracy from {pct(none.accuracy)} to {pct(rec.accuracy)}. Weighing every item on a scale triples the time for less than half a point.
        </p>
        <div className="overflow-x-auto"><div className="min-w-[640px]"><EffortChart rows={bench.effort} recommended="all-pos" ceiling={bench.ceiling} /></div></div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-600 text-text-primary">Every version, same kitchens, same 12 weeks</h2>
        <p className="mt-0.5 text-sm text-text-secondary">Each step adds signals on top of the last. Scored on weeks 3-12, averaged across 5 simulated kitchens.</p>
        <div className="mt-6">
          <div className="overflow-x-auto"><div className="min-w-[640px]"><VersionLadder versions={bench.versions} ceiling={bench.ceiling} /></div></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <h2 className="font-display text-lg font-600 text-text-primary">Accuracy week by week</h2>
          <p className="mb-4 mt-0.5 text-sm text-text-secondary">Priors stay flat. The learning layer closes most of the gap within two weeks of logs.</p>
          <LearningCurve weeks={bench.weeks} />
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
              <span className="text-text-primary">Hidden truth.</span> The test kitchens have their own habits (over-prepped basil, a slow Monday, rain that hits harder than average) that the model is never told.
            </li>
            <li>
              <span className="text-text-primary">Best possible.</span> A forecaster that knew the kitchen&apos;s true habits but, like any real one at 8am, only has reservations. Walk-ins and daily randomness are out of reach.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
