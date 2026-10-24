"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DayPrediction, DayWeather, EventType, Ingredient, NearbyEvent, Scenario, WasteLog } from "./types";
import { DEMO_INGREDIENTS, COVERS_BY_DAY, seedTodayLogs, parseLocalDate } from "./demo-data";
import { buildDayForecast } from "./forecast";
import { describe, fallbackWeek } from "./weather";

const STORAGE_KEY = "freshcast:v2";

export const EVENTS: Record<EventType, NearbyEvent> = {
  none: { type: "none", name: "", distanceMiles: 0 },
  game: { type: "game", name: "Celtics at TD Garden", distanceMiles: 0.6 },
  concert: { type: "concert", name: "Concert at TD Garden", distanceMiles: 0.6 },
  festival: { type: "festival", name: "North End Feast", distanceMiles: 0.2 },
  graduation: { type: "graduation", name: "Suffolk commencement", distanceMiles: 0.8 },
};

interface StoreValue {
  hydrated: boolean;
  ingredients: Ingredient[];
  logs: WasteLog[];
  scenario: Scenario;
  weatherSource: "live" | "offline" | "loading";
  week: DayPrediction[];
  selected: DayPrediction | null;
  addIngredient: (i: Ingredient) => void;
  updateIngredient: (i: Ingredient) => void;
  removeIngredient: (id: string) => void;
  addLog: (l: WasteLog) => void;
  removeLog: (id: string) => void;
  setScenario: (patch: Partial<Scenario>) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const DEFAULT_SCENARIO: Scenario = { selectedDate: null, coversOverride: null, weatherOverride: "live", event: "none" };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEMO_INGREDIENTS);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [scenario, setScenarioState] = useState<Scenario>(DEFAULT_SCENARIO);
  const [days, setDays] = useState<DayWeather[]>([]);
  const [weatherSource, setWeatherSource] = useState<"live" | "offline" | "loading">("loading");

  // Load saved kitchen data once on the client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.ingredients)) setIngredients(saved.ingredients);
        if (Array.isArray(saved.logs)) setLogs(saved.logs);
      } else {
        setLogs(seedTodayLogs());
      }
    } catch {
      setLogs(seedTodayLogs());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ingredients, logs }));
  }, [hydrated, ingredients, logs]);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then((data: { source: "live" | "offline"; days: DayWeather[] }) => {
        setDays(data.days);
        setWeatherSource(data.source);
      })
      .catch(() => {
        setDays(fallbackWeek());
        setWeatherSource("offline");
      });
  }, []);

  const setScenario = useCallback((patch: Partial<Scenario>) => setScenarioState((s) => ({ ...s, ...patch })), []);

  const week = useMemo(() => {
    if (days.length === 0) return [];
    const selectedDate = scenario.selectedDate ?? days[0].date;
    return days.map((day) => {
      const isSelected = day.date === selectedDate;
      const date = parseLocalDate(day.date);
      const overridden = isSelected && scenario.weatherOverride !== "live";
      const weather: DayWeather = overridden
        ? { ...day, condition: scenario.weatherOverride as DayWeather["condition"], description: describe(scenario.weatherOverride as DayWeather["condition"], day.tempF) }
        : day;
      const covers = isSelected && scenario.coversOverride !== null ? scenario.coversOverride : COVERS_BY_DAY[date.getDay()];
      return buildDayForecast({
        ingredients,
        expectedCovers: covers,
        weather,
        weatherSource: overridden ? "override" : weatherSource === "live" ? "live" : "offline",
        event: isSelected ? EVENTS[scenario.event] : EVENTS.none,
        date,
      });
    });
  }, [days, ingredients, scenario, weatherSource]);

  const selected = useMemo(() => {
    if (week.length === 0) return null;
    return week.find((d) => d.date === scenario.selectedDate) ?? week[0];
  }, [week, scenario.selectedDate]);

  const value: StoreValue = {
    hydrated,
    ingredients,
    logs,
    scenario,
    weatherSource,
    week,
    selected,
    addIngredient: (i) => setIngredients((prev) => [...prev, i]),
    updateIngredient: (i) => setIngredients((prev) => prev.map((p) => (p.id === i.id ? i : p))),
    removeIngredient: (id) => setIngredients((prev) => prev.filter((p) => p.id !== id)),
    addLog: (l) => setLogs((prev) => [l, ...prev]),
    removeLog: (id) => setLogs((prev) => prev.filter((p) => p.id !== id)),
    setScenario,
    resetDemo: () => {
      setIngredients(DEMO_INGREDIENTS);
      setLogs(seedTodayLogs());
      setScenarioState(DEFAULT_SCENARIO);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
