"use client";

import { CalendarDays, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useStore, EVENTS } from "@/lib/store";
import { EventType, WeatherCondition } from "@/lib/types";
import { parseLocalDate } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const WEATHER_OPTIONS: { value: WeatherCondition | "live"; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "normal", label: "Dry" },
  { value: "rain", label: "Rain" },
  { value: "hot", label: "Heat" },
  { value: "cold", label: "Cold" },
];

const EVENT_OPTIONS = (["none", "game", "concert", "festival", "graduation"] as EventType[]).map((v) => ({
  value: v,
  label: v === "none" ? "No nearby event" : EVENTS[v].name,
  hint: v === "none" ? undefined : `${EVENTS[v].distanceMiles} mi`,
}));

// What-if controls for the selected day. Every change reruns the model.
export function ScenarioBar() {
  const { selected, scenario, setScenario, profile } = useStore();
  if (!selected) return null;

  const defaultCovers = profile.coversByDay[parseLocalDate(selected.date).getDay()];
  const covers = scenario.coversOverride ?? defaultCovers;
  const touched = scenario.coversOverride !== null || scenario.weatherOverride !== "live" || scenario.event !== "none";

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-surface px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-600 text-text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" /> What if
      </span>

      <label className="flex items-center gap-3 text-sm text-text-secondary" title={`Usual for this weekday: ${defaultCovers}. Drag if you know it will be busier or quieter.`}>
        Guests
        <input
          type="range"
          min={Math.max(5, Math.round(defaultCovers * 0.3))}
          max={Math.max(20, Math.round(defaultCovers * 1.8))}
          value={covers}
          onChange={(e) => setScenario({ coversOverride: Number(e.target.value) })}
          className="h-1 w-36 cursor-pointer accent-good"
          aria-label="Expected guests (covers)"
        />
        <span className="w-9 font-600 tabular-nums text-text-primary">{covers}</span>
      </label>

      <div className="flex items-center gap-1 rounded-md bg-canvas p-0.5" role="group" aria-label="Weather">
        {WEATHER_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setScenario({ weatherOverride: o.value })}
            className={cn(
              "rounded px-2.5 py-1 text-xs transition-colors duration-150",
              scenario.weatherOverride === o.value ? "bg-surface-hover font-600 text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <Select
        label="Nearby event"
        value={scenario.event}
        options={EVENT_OPTIONS}
        onChange={(v) => setScenario({ event: v })}
        icon={<CalendarDays className="h-3.5 w-3.5 text-text-muted" />}
        className="w-56"
      />

      {touched && (
        <button
          onClick={() => setScenario({ coversOverride: null, weatherOverride: "live", event: "none" })}
          className="ml-auto flex items-center gap-1.5 text-xs text-text-muted transition-colors duration-150 hover:text-text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Back to live forecast
        </button>
      )}
    </div>
  );
}
