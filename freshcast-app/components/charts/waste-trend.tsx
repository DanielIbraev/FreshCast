"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { parseLocalDate } from "@/lib/demo-data";

interface WasteTrendProps {
  data: { date: string; wasteCost: number }[];
}

const short = (d: string) => {
  const date = parseLocalDate(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export function WasteTrend({ data }: WasteTrendProps) {
  // FreshCast recommendations started on day 8
  const adoptionDate = data[7]?.date;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={short} interval={4} axisLine={{ stroke: "#2D3748" }} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={{ background: "#1A1D27", border: "1px solid #2D3748", borderRadius: "8px", color: "#E2E8F0", fontSize: 12 }}
            labelStyle={{ color: "#94A3B8" }}
            labelFormatter={(d) => short(String(d))}
            formatter={(v) => [`$${v}`, "Waste"]}
          />
          {adoptionDate && (
            <ReferenceLine
              x={adoptionDate}
              stroke="#60A5FA"
              strokeDasharray="4 4"
              label={{ value: "FreshCast on", fill: "#60A5FA", fontSize: 10, position: "top" }}
            />
          )}
          {/* animation off: an empty chart mid-animation is worse on a demo screen than no animation */}
          <Area type="monotone" dataKey="wasteCost" stroke="#10B981" strokeWidth={2} fill="url(#wasteGrad)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
