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
    return <div className="flex h-[118px] gap-2 overflow-hidden xl:grid xl:grid-cols-7">{Array.from({ length: 7 }, (_, i) => <div key={i} className="min-w-[128px] animate-pulse rounded-lg bg-surface xl:min-w-0" />)}</div>;
  }

  const open = week.filter((d) => !d.closed);
  const max = Math.max(...open.map((d) => d.totalWasteCost), 0);
  const min = Math.min(...open.map((d) => d.totalWasteCost), max);

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-8 md:px-8 xl:mx-0 xl:grid xl:grid-cols-7 xl:overflow-visible xl:px-0 xl:pb-0">
      {week.map((day) => {
        const date = parseLocalDate(day.date);
        const isSel = selected?.date === day.date;
        if (day.closed) {
          return (
            <div key={day.date} className="flex min-w-[128px] flex-col rounded-lg border border-dashed border-border px-3 py-3 xl:min-w-0" aria-label={`${DAY_SHORT[date.getDay()]} ${date.getDate()}: closed`}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="whitespace-nowrap font-600 text-text-muted">
                  {DAY_SHORT[date.getDay()]} {date.getDate()}
                </span>
                <span className="tabular-nums text-text-muted">{Math.round(day.weather.tempF)}°F</span>
              </div>
              <span className="mt-0.5 text-xs text-text-muted">No prep</span>
              <span className="mt-2 font-display text-lg font-600 text-text-muted">Closed</span>
            </div>
          );
        }
        // 0 = lowest-risk day of the week, 1 = highest
        const t = max === min ? 0.5 : (day.totalWasteCost - min) / (max - min);
        const riskColor = t > 0.66 ? "#EF4444" : t > 0.33 ? "#F59E0B" : "#10B981";
        // Hallmark 39b: each day is a card-sized button (about 107px tall) on
        // purpose. It shows the day, weather, guests and the forecast cost, and
        // the whole card is the target; a 40px row would hide what you pick by.
        return (
          <button
            key={day.date}
            onClick={() => setScenario({ selectedDate: day.date, coversOverride: null, weatherOverride: "live", event: "none" })}
            className={cn(
              "group flex min-w-[128px] flex-col rounded-lg border px-3 py-3 text-left transition-colors duration-150 xl:min-w-0",
              isSel ? "border-good bg-surface-hover" : "border-border bg-surface hover:border-text-muted"
            )}
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={cn("whitespace-nowrap font-600", isSel ? "text-text-primary" : "text-text-secondary")}>
                {DAY_SHORT[date.getDay()]} {date.getDate()}
              </span>
              <span className="flex shrink-0 items-center gap-1 tabular-nums text-text-muted">
                <WeatherIcon condition={day.weather.condition} className="h-4 w-4 text-data" />
                {Math.round(day.weather.tempF)}°F
              </span>
            </div>
            <span className="mt-0.5 text-xs tabular-nums text-text-muted">{day.expectedCovers} guests</span>
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
