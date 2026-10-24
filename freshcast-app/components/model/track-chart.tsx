"use client";

import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrackRecord } from "@/lib/track-record";
import { axisTick, lastNights, shortDate, usd } from "./format";

interface Row {
  date: string;
  band: [number, number];
  forecast: number;
  actual: number;
  binned: number | null;
}

function Swatch({ kind, color, label }: { kind: "band" | "line" | "dot"; color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {kind === "band" && <span className="h-2.5 w-4 rounded-sm" style={{ background: color, opacity: 0.25 }} />}
      {kind === "line" && <span className="h-0.5 w-4 rounded" style={{ background: color }} />}
      {kind === "dot" && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {label}
    </span>
  );
}

function Tip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  const inside = r.actual >= r.band[0] && r.actual <= r.band[1];
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-none">
      <p className="mb-1 text-text-secondary">{shortDate(r.date)}</p>
      <p className="tabular-nums text-text-primary">Forecast {usd(r.forecast)} <span className="text-text-muted">({usd(r.band[0])}–{usd(r.band[1])})</span></p>
      <p className="tabular-nums text-text-primary">
        Happened {usd(r.actual)} <span className={inside ? "text-good" : "text-caution"}>{inside ? "inside range" : "outside range"}</span>
      </p>
      {r.binned !== null && <p className="tabular-nums text-text-muted">Binned after the plan {usd(r.binned)}</p>}
    </div>
  );
}

export function TrackChart({ tr }: { tr: TrackRecord }) {
  const reduce = useReducedMotion();
  const n = lastNights(tr);
  const data: Row[] = tr.nights.map((x) => ({
    date: x.date,
    band: [Math.round(x.lowCost), Math.round(x.highCost)],
    forecast: Math.round(x.forecastCost),
    actual: Math.round(x.actualCost),
    binned: x.onPlan ? Math.round(x.binnedCost) : null,
  }));
  const headline =
    n.count === 0
      ? "Nights are scored from the fourth close-out on"
      : `Last ${n.count >= 28 ? "4 weeks" : `${n.count} nights`}, ${n.inside} of ${n.count} nights landed inside the forecast range`;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="max-w-2xl">
          <h2 className="font-display text-lg font-600 text-text-primary">{headline}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Forecast vs. what happened, by night. Both are dollars of waste if the kitchen had prepped as usual, so nights before and after the plan compare
            directly.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <Swatch kind="band" color="#60A5FA" label="Forecast range" />
          <Swatch kind="line" color="#60A5FA" label="Morning forecast" />
          <Swatch kind="dot" color="#E2E8F0" label="What happened" />
          {tr.planStart && <Swatch kind="line" color="#10B981" label="Actually binned" />}
        </div>
      </div>
      <div className="mt-5 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 22, right: 12, left: -8, bottom: 0 }}>
            <XAxis dataKey="date" tick={axisTick} tickFormatter={shortDate} interval={Math.max(0, Math.floor(data.length / 8))} axisLine={{ stroke: "#2D3748" }} tickLine={false} minTickGap={16} />
            <YAxis tick={axisTick} tickFormatter={(v: number) => `$${v}`} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<Tip />} cursor={{ stroke: "#2D3748" }} />
            {tr.planStart && (
              <ReferenceLine
                x={tr.planStart}
                stroke="#94A3B8"
                strokeDasharray="4 4"
                label={{ value: "Started prepping to plan", fill: "#94A3B8", fontSize: 11, position: "insideTopLeft", dy: -18 }}
              />
            )}
            <Area dataKey="band" stroke="none" fill="#60A5FA" fillOpacity={0.16} isAnimationActive={!reduce} animationDuration={800} />
            <Line dataKey="forecast" stroke="#60A5FA" strokeWidth={2} dot={false} isAnimationActive={!reduce} animationDuration={800} />
            <Line dataKey="binned" stroke="#10B981" strokeWidth={1.5} strokeOpacity={0.8} dot={false} connectNulls={false} isAnimationActive={!reduce} animationDuration={800} />
            <Line dataKey="actual" stroke="#E2E8F0" strokeOpacity={0.35} strokeWidth={1} dot={{ r: 2.5, fill: "#E2E8F0", strokeWidth: 0 }} activeDot={{ r: 4 }} isAnimationActive={!reduce} animationDuration={800} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
