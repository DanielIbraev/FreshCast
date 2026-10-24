"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useStore, EVENTS } from "@/lib/store";
import { EventType, WeatherCondition } from "@/lib/types";
import { COVERS_BY_DAY, parseLocalDate } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const WEATHER_OPTIONS: { value: WeatherCondition | "live"; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "normal", label: "Dry" },
  { value: "rain", label: "Rain" },
  { value: "hot", label: "Heat" },
  { value: "cold", label: "Cold" },
];

const EVENT_OPTIONS: { value: EventType; label: string }[] = [
  { value: "none", label: "No event" },
  { value: "game", label: "Celtics game" },
  { value: "festival", label: "Street festival" },
  { value: "graduation", label: "Graduation" },
];

// What-if controls for the selected day. Every change reruns the model.
export function ScenarioBar() {
  const { selected, scenario, setScenario } = useStore();
  if (!selected) return null;

  const defaultCovers = COVERS_BY_DAY[parseLocalDate(selected.date).getDay()];
  const covers = scenario.coversOverride ?? defaultCovers;
  const touched = scenario.coversOverride !== null || scenario.weatherOverride !== "live" || scenario.event !== "none";

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-surface px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-600 uppercase tracking-wider text-text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" /> What if
      </span>

      <label className="flex items-center gap-3 text-sm text-text-secondary">
        Covers
        <input
          type="range"
          min={15}
          max={110}
          value={covers}
          onChange={(e) => setScenario({ coversOverride: Number(e.target.value) })}
          className="h-1 w-36 cursor-pointer accent-good"
          aria-label="Expected covers"
        />
        <span className="w-8 font-600 tabular-nums text-text-primary">{covers}</span>
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

      <select
        value={scenario.event}
        onChange={(e) => setScenario({ event: e.target.value as EventType })}
        className="rounded-md border border-border bg-canvas px-2.5 py-1.5 text-xs text-text-primary focus:border-good focus:outline-none"
        aria-label="Nearby event"
      >
        {EVENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.value !== "none" ? ` · ${EVENTS[o.value].distanceMiles} mi` : ""}
          </option>
        ))}
      </select>

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
