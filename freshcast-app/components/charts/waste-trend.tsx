"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WasteTrendProps {
  data: { date: string; wasteCost: number }[];
}

export function WasteTrend({ data }: WasteTrendProps) {
  // Mark where FreshCast recommendations kicked in (day 7)
  const adoptionDate = data[7]?.date;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickFormatter={(d: string) => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            interval={4}
            axisLine={{ stroke: "#2D3748" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 11 }}
            tickFormatter={(v: number) => `$${v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1A1D27",
              border: "1px solid #2D3748",
              borderRadius: "8px",
              color: "#E2E8F0",
            }}
            labelStyle={{ color: "#94A3B8" }}
            formatter={(v: number) => [`$${v}`, "Daily waste"]}
          />
          {adoptionDate && (
            <ReferenceLine
              x={adoptionDate}
              stroke="#60A5FA"
              strokeDasharray="4 4"
              label={{
                value: "FreshCast on",
                fill: "#60A5FA",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="wasteCost"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#wasteGrad)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
