"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Ingredient } from "@/lib/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

// Daily prep value by category: where the kitchen's money sits each morning.
export function CategoryDonut({ ingredients }: { ingredients: Ingredient[] }) {
  const data = CATEGORY_ORDER.map((c) => ({
    key: c,
    name: CATEGORIES[c].label,
    color: CATEGORIES[c].color,
    value: Math.round(ingredients.filter((i) => i.category === c).reduce((s, i) => s + i.baselinePrepKg * i.costPerKg, 0)),
  })).filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={2} stroke="none" animationDuration={800}>
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1A1D27", border: "1px solid #2D3748", borderRadius: 8, color: "#E2E8F0", fontSize: 12 }}
              formatter={(v) => formatCurrency(Number(v))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-700 tabular-nums text-text-primary">{formatCurrency(total)}</span>
          <span className="text-[10px] text-text-muted">per day</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="tabular-nums text-text-primary">
              {formatCurrency(d.value)} <span className="text-text-muted">· {Math.round((d.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
