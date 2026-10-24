"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DayTotal } from "@/lib/history";
import { parseLocalDate } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

export interface Week {
  start: string;
  label: string;
  cost: number; // $ of food binned that week
  onPlan: boolean;
}

// Full calendar weeks of close-outs, oldest first. The current, unfinished
// week is left out so the last bar isn't misleadingly short.
export function weeklyBin(totals: DayTotal[]): Week[] {
  if (!totals.length) return [];
  const first = parseLocalDate(totals[0].date).getTime();
  const weeks = new Map<number, { cost: number; plan: number; days: number; start: string }>();
  for (const t of totals) {
    const w = Math.floor((parseLocalDate(t.date).getTime() - first) / (7 * 86_400_000));
    const x = weeks.get(w) ?? { cost: 0, plan: 0, days: 0, start: t.date };
    x.cost += t.wasteCost;
    x.plan += t.onPlan ? 1 : 0;
    x.days += 1;
    weeks.set(w, x);
  }
  const last = Math.max(...weeks.keys());
  const lastStart = parseLocalDate(totals[0].date).getTime() + last * 7 * 86_400_000;
  const complete = Date.now() - lastStart >= 7 * 86_400_000;
  return [...weeks.entries()]
    .filter(([w]) => w !== last || complete)
    .sort((a, b) => a[0] - b[0])
    .map(([, x]) => ({
      start: x.start,
      label: parseLocalDate(x.start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cost: Math.round(x.cost),
      onPlan: x.plan * 2 > x.days,
    }));
}

const RED = "#EF4444";
const GREEN = "#10B981";

// One bar per week: red before the kitchen used the plan, green after.
export function WeeklyBin({ weeks }: { weeks: Week[] }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeks} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="22%">
          <XAxis dataKey="label" tick={{ fill: "#8291A7", fontSize: 11 }} axisLine={{ stroke: "#2D3748" }} tickLine={false} interval={0} />
          <YAxis tick={{ fill: "#8291A7", fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} axisLine={false} tickLine={false} width={52} />
          <Tooltip
            cursor={{ fill: "#222634" }}
            contentStyle={{ background: "#1A1D27", border: "1px solid #2D3748", borderRadius: 8, color: "#E2E8F0", fontSize: 12 }}
            labelFormatter={(l) => `Week of ${l}`}
            formatter={(v, _n, item) => [formatCurrency(Number(v)), (item?.payload as Week)?.onPlan ? "Binned, prepping to plan" : "Binned, prepping as usual"]}
          />
          <Bar dataKey="cost" radius={[4, 4, 0, 0]} isAnimationActive={animate} animationDuration={800}>
            {weeks.map((w) => (
              <Cell key={w.start} fill={w.onPlan ? GREEN : RED} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
