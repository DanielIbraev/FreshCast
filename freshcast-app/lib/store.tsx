"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DayPrediction, DayWeather, Ingredient, Scenario, WasteLog } from "./types";
import { DEMO_INGREDIENTS, COVERS_BY_DAY, EVENTS, seedTodayLogs, parseLocalDate, localISO } from "./demo-data";
import { buildDayForecast } from "./forecast";
import { describe, fallbackWeek } from "./weather";
import { runBacktest } from "./backtest";
import * as db from "./db";
import { DailyObservation, DbStatus, Snapshot } from "./db";

export { EVENTS };

interface StoreValue {
  hydrated: boolean;
  dbStatus: DbStatus;
  ingredients: Ingredient[];
  logs: WasteLog[];
  observations: DailyObservation[];
  scenario: Scenario;
  weatherSource: "live" | "offline" | "loading";
  today: DayPrediction | null; // tonight's close-out is scored against this
  week: DayPrediction[];
  selected: DayPrediction | null;
  addIngredient: (i: Ingredient) => void;
  updateIngredient: (i: Ingredient) => void;
  removeIngredient: (id: string) => void;
  addLog: (l: WasteLog) => void;
  removeLog: (id: string) => void;
  closeOutToday: () => Promise<number>;
  setScenario: (patch: Partial<Scenario>) => void;
  resetDemo: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);
const DEFAULT_SCENARIO: Scenario = { selectedDate: null, coversOverride: null, weatherOverride: "live", event: "none" };

// Marco's history: 12 weeks of nightly close-outs. Weeks 1-2 he only logged
// (FreshCast watching); from week 3 he prepped to the plan.
function demoSnapshot(): Snapshot {
  const bt = runBacktest(DEMO_INGREDIENTS, 12, 7, new Date(), 14);
  return { ingredients: DEMO_INGREDIENTS, logs: seedTodayLogs(), observations: bt.closeouts };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatus>("loading");
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEMO_INGREDIENTS);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [observations, setObservations] = useState<DailyObservation[]>([]);
  const [scenario, setScenarioState] = useState<Scenario>(DEFAULT_SCENARIO);
  const [days, setDays] = useState<DayWeather[]>([]);
  const [weatherSource, setWeatherSource] = useState<"live" | "offline" | "loading">("loading");

  const apply = (s: Snapshot) => {
    setIngredients(s.ingredients);
    setLogs(s.logs);
    setObservations(s.observations);
  };

  // Boot: Supabase first. Empty database gets Marco's history written to it.
  useEffect(() => {
    (async () => {
      const remote = await db.loadRemote().catch(() => null);
      if (remote && remote.ingredients.length > 0) {
        apply(remote);
        setDbStatus("connected");
      } else if (remote) {
        const seed = demoSnapshot();
        apply(seed);
        setDbStatus((await db.writeSnapshot(seed)) ? "connected" : "local");
      } else {
        apply(db.loadLocal() ?? demoSnapshot());
        setDbStatus("local");
      }
      setHydrated(true);
    })();
  }, []);

  // Local mirror, so the app still works if Supabase drops mid-demo.
  useEffect(() => {
    if (hydrated) db.saveLocal({ ingredients, logs, observations });
  }, [hydrated, ingredients, logs, observations]);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then((d: { source: "live" | "offline"; days: DayWeather[] }) => {
        setDays(d.days);
        setWeatherSource(d.source);
      })
      .catch(() => {
        setDays(fallbackWeek());
        setWeatherSource("offline");
      });
  }, []);

  // Wrap a remote write: on failure, flip the status pill instead of throwing.
  const sync = useCallback((p: Promise<boolean> | undefined) => {
    p?.then((ok) => !ok && setDbStatus("local")).catch(() => setDbStatus("local"));
  }, []);

  const setScenario = useCallback((patch: Partial<Scenario>) => setScenarioState((s) => ({ ...s, ...patch })), []);
  const learningObs = useMemo(() => db.toLearningObs(observations), [observations]);
  const src = weatherSource === "live" ? "live" : "offline";

  const today = useMemo(() => {
    if (!days[0]) return null;
    const date = parseLocalDate(days[0].date);
    return buildDayForecast({ ingredients, observations: learningObs, expectedCovers: COVERS_BY_DAY[date.getDay()], weather: days[0], weatherSource: src, event: EVENTS.none, date });
  }, [days, ingredients, learningObs, src]);

  const week = useMemo(() => {
    const forecastDays = days.slice(1);
    if (!forecastDays.length) return [];
    const selDate = scenario.selectedDate ?? forecastDays[0].date;
    return forecastDays.map((day) => {
      const isSel = day.date === selDate;
      const date = parseLocalDate(day.date);
      const over = isSel && scenario.weatherOverride !== "live";
      const cond = over ? (scenario.weatherOverride as DayWeather["condition"]) : day.condition;
      return buildDayForecast({
        ingredients,
        observations: learningObs,
        expectedCovers: isSel && scenario.coversOverride !== null ? scenario.coversOverride : COVERS_BY_DAY[date.getDay()],
        weather: over ? { ...day, condition: cond, description: describe(cond, day.tempF) } : day,
        weatherSource: over ? "override" : src,
        event: isSel ? EVENTS[scenario.event] : EVENTS.none,
        date,
      });
    });
  }, [days, ingredients, learningObs, scenario, src]);

  const selected = useMemo(() => week.find((d) => d.date === scenario.selectedDate) ?? week[0] ?? null, [week, scenario.selectedDate]);

  // Tonight's close-out: today's logs per ingredient become one observation each.
  const closeOutToday = useCallback(async () => {
    if (!today) return 0;
    const todayKey = today.date;
    const isToday = (l: WasteLog) => localISO(new Date(l.loggedAt)) === todayKey;
    const rows: DailyObservation[] = today.ingredients.map((p) => ({
      date: todayKey,
      ingredientId: p.ingredient.id,
      priorKg: p.priorKg,
      cutKg: p.cutKg,
      loggedKg: Math.round(logs.filter((l) => isToday(l) && l.ingredientId === p.ingredient.id).reduce((s, l) => s + l.quantityKg, 0) * 1000) / 1000,
      weather: today.weather.condition,
      covers: today.expectedCovers,
    }));
    setObservations((prev) => [...prev.filter((o) => o.date !== todayKey), ...rows]);
    sync(db.upsertObservations(rows));
    return rows.length;
  }, [today, logs, sync]);

  const value: StoreValue = {
    hydrated, dbStatus, ingredients, logs, observations, scenario, weatherSource, today, week, selected,
    addIngredient: (i) => { setIngredients((p) => [...p, i]); sync(db.upsertIngredient(i)); },
    updateIngredient: (i) => { setIngredients((p) => p.map((x) => (x.id === i.id ? i : x))); sync(db.upsertIngredient(i)); },
    removeIngredient: (id) => {
      setIngredients((p) => p.filter((x) => x.id !== id));
      setLogs((p) => p.filter((x) => x.ingredientId !== id));
      setObservations((p) => p.filter((x) => x.ingredientId !== id));
      sync(db.deleteIngredient(id));
    },
    addLog: (l) => { setLogs((p) => [l, ...p]); sync(db.insertLog(l)); },
    removeLog: (id) => { setLogs((p) => p.filter((x) => x.id !== id)); sync(db.deleteLog(id)); },
    closeOutToday,
    setScenario,
    resetDemo: async () => {
      const seed = demoSnapshot();
      apply(seed);
      setScenarioState(DEFAULT_SCENARIO);
      if (dbStatus === "connected") {
        await db.wipeRemote();
        sync(db.writeSnapshot(seed));
      }
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
