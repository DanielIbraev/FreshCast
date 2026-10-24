"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { WeekResult } from "@/lib/backtest";

export function LearningCurve({ weeks }: { weeks: WeekResult[] }) {
  const data = weeks.map((w) => ({
    week: `W${w.week}`,
    "Rule of thumb": +(w.naive * 100).toFixed(1),
    "Priors only": +(w.priorOnly * 100).toFixed(1),
    "FreshCast (learning)": +(w.learned * 100).toFixed(1),
    "Best possible": +(w.ceiling * 100).toFixed(1),
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={{ stroke: "#2D3748" }} tickLine={false} />
          <YAxis domain={[50, 100]} tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#1A1D27", border: "1px solid #2D3748", borderRadius: 8, color: "#E2E8F0", fontSize: 12 }}
            formatter={(v) => `${v}%`}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} iconType="plainline" />
          <Line dataKey="Rule of thumb" stroke="#EF4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="Priors only" stroke="#94A3B8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="FreshCast (learning)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 2.5 }} isAnimationActive={false} />
          <Line dataKey="Best possible" stroke="#60A5FA" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
