"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { trackRecord } from "@/lib/track-record";
import { Kpis } from "@/components/model/kpis";
import { TrackChart } from "@/components/model/track-chart";
import { RollingChart } from "@/components/model/rolling-chart";
import { ItemTable } from "@/components/model/item-table";
import { Actions } from "@/components/model/actions";
import { Validation } from "@/components/model/validation";
import { ModelEmpty, ModelSkeleton } from "@/components/model/states";
import { benchFor } from "@/components/model/format";

export default function ModelPage() {
  const { profile, ingredients, observations, hydrated } = useStore();
  const tr = useMemo(() => trackRecord(observations, ingredients, profile), [observations, ingredients, profile]);
  const { b, own } = benchFor(profile.id);

  if (!hydrated) return <ModelSkeleton />;

  return (
    <div className="space-y-5">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Model accuracy</h1>
          {profile.isDemo && (
            <span className="rounded-md border border-border px-2 py-0.5 text-[11px] text-text-muted">Simulated history</span>
          )}
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          <span className="text-text-primary">{profile.name}</span>: <span className="tabular-nums">{tr.openNights}</span> open{" "}
          {tr.openNights === 1 ? "night" : "nights"} logged
          {tr.openNights < 4 ? " so far." : ", each forecast scored against that night\u2019s close-out."}
        </p>
      </header>

      {tr.openNights < 4 ? (
        <ModelEmpty nights={tr.openNights} />
      ) : (
        <>
          <Kpis tr={tr} bench={own ? b : null} />
          <TrackChart tr={tr} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
            <RollingChart
              rolling={tr.rolling}
              planStart={tr.planStart}
              ceiling={own ? b.ceiling : null}
            />
            <Actions actions={tr.actions} />
          </div>
          <ItemTable items={tr.items} />
        </>
      )}

      <Validation b={b} own={own} restaurantName={profile.name} />
    </div>
  );
}
