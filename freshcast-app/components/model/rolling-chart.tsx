"use client";

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { RollingPoint } from "@/lib/track-record";
import { axisTick, pct, shortDate, tooltipStyle } from "./format";

function headlineFor(rolling: RollingPoint[]) {
  const a = rolling[0].accuracy;
  const b = rolling[rolling.length - 1].accuracy;
  const d = (b - a) * 100;
  if (d >= 2) return `Accuracy rose from ${pct(a)} to ${pct(b)} as the model learned this kitchen`;
  if (d <= -2) return `7-night accuracy slipped from ${pct(a)} to ${pct(b)}. The item table below shows where`;
  return `7-night accuracy has held near ${pct(b)} since scoring began`;
}

export function RollingChart({ rolling, planStart, ceiling, ceilingLabel }: { rolling: RollingPoint[]; planStart: string | null; ceiling: number | null; ceilingLabel: string }) {
  const reduce = useReducedMotion();
  if (rolling.length < 2) {
    return (
      <Card>
        <h2 className="font-display text-lg font-600 text-text-primary">7-night accuracy appears after 10 open nights</h2>
        <p className="mt-1 text-sm text-text-secondary">Each point averages the last 7 nights, so the line needs a full week of scored close-outs first.</p>
      </Card>
    );
  }
  const data = rolling.map((r) => ({ date: r.date, acc: +(r.accuracy * 100).toFixed(1) }));
  const vals = data.map((d) => d.acc).concat(ceiling ? [ceiling * 100] : []);
  const lo = Math.max(0, Math.floor((Math.min(...vals) - 4) / 5) * 5);
  const hi = Math.min(100, Math.ceil((Math.max(...vals) + 3) / 5) * 5);
  const markPlan = planStart && data.some((d) => d.date === planStart);

  return (
    <Card>
      <h2 className="font-display text-lg font-600 text-text-primary">{headlineFor(rolling)}</h2>
      <p className="mt-0.5 text-sm text-text-secondary">
        Each point scores the 7 nights before it, weighted by kg.
        {ceiling ? ` Dashed line: ${ceilingLabel}.` : ""}
      </p>
      <div className="mt-5 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 22, right: 12, left: -8, bottom: 0 }}>
            <XAxis dataKey="date" tick={axisTick} tickFormatter={shortDate} interval={Math.max(0, Math.floor(data.length / 6))} axisLine={{ stroke: "#2D3748" }} tickLine={false} minTickGap={16} />
            <YAxis domain={[lo, hi]} tick={axisTick} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} width={52} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#94A3B8" }} labelFormatter={(d) => `7 nights to ${shortDate(String(d))}`} formatter={(v) => [`${v}%`, "Accuracy"]} />
            {markPlan && (
              <ReferenceLine
                x={planStart!}
                stroke="#94A3B8"
                strokeDasharray="4 4"
                label={{ value: "Started prepping to plan", fill: "#94A3B8", fontSize: 11, position: "insideTopLeft", dy: -18 }}
              />
            )}
            {ceiling && (
              <ReferenceLine
                y={+(ceiling * 100).toFixed(1)}
                stroke="#60A5FA"
                strokeOpacity={0.7}
                strokeDasharray="5 4"
                label={{ value: `Best possible ${pct(ceiling)}`, fill: "#60A5FA", fontSize: 11, position: "insideBottomRight" }}
              />
            )}
            <Line dataKey="acc" stroke="#10B981" strokeWidth={2.25} dot={false} activeDot={{ r: 4 }} isAnimationActive={!reduce} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
