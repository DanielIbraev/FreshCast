"use client";

import { useStore } from "@/lib/store";
import { parseLocalDate } from "@/lib/demo-data";
import { WeatherIcon } from "@/components/weather-icon";
import { cn, formatCurrency } from "@/lib/utils";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Seven-day outlook. Each day is a full model run; click one to forecast it.
export function WeekStrip() {
  const { week, selected, setScenario } = useStore();
  if (week.length === 0) {
    return <div className="grid h-[118px] grid-cols-7 gap-2">{Array.from({ length: 7 }, (_, i) => <div key={i} className="animate-pulse rounded-lg bg-surface" />)}</div>;
  }

  const max = Math.max(...week.map((d) => d.totalWasteCost));
  const min = Math.min(...week.map((d) => d.totalWasteCost));

  return (
    <div className="grid grid-cols-7 gap-2">
      {week.map((day) => {
        const date = parseLocalDate(day.date);
        const isSel = selected?.date === day.date;
        // 0 = lowest-risk day of the week, 1 = highest
        const t = max === min ? 0.5 : (day.totalWasteCost - min) / (max - min);
        const riskColor = t > 0.66 ? "#EF4444" : t > 0.33 ? "#F59E0B" : "#10B981";
        return (
          <button
            key={day.date}
            onClick={() => setScenario({ selectedDate: day.date, coversOverride: null, weatherOverride: "live", event: "none" })}
            className={cn(
              "group flex flex-col rounded-lg border px-3 py-3 text-left transition-colors duration-150",
              isSel ? "border-good bg-surface-hover" : "border-border bg-surface hover:border-text-muted"
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn("text-xs font-600", isSel ? "text-text-primary" : "text-text-secondary")}>
                {DAY_SHORT[date.getDay()]} {date.getDate()}
              </span>
              <WeatherIcon condition={day.weather.condition} className="h-4 w-4 text-data" />
            </div>
            <span className="mt-0.5 text-[11px] text-text-muted">{Math.round(day.weather.tempF)}°F · {day.expectedCovers} guests</span>
            <span className="mt-2 font-display text-lg font-700 tabular-nums" style={{ color: riskColor }}>
              {formatCurrency(day.totalWasteCost)}
            </span>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full" style={{ width: `${30 + t * 70}%`, background: riskColor }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
