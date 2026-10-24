"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DayPrediction, DayWeather, Ingredient, Scenario, WasteLog } from "./types";
import { DEMO_INGREDIENTS, EVENTS, seedTodayLogs, parseLocalDate, localISO } from "./demo-data";
import { buildDayForecast } from "./forecast";
import { describe, fallbackWeek } from "./weather";
import { priorWasteKg } from "./prediction";
import { runBacktest } from "./backtest";
import { DEMO_PROFILE, Profile, loadProfile, saveProfile, clearProfile } from "./profile";
import { readAdminToken } from "./admin";
import { setAdminToken } from "./supabase";
import * as db from "./db";
import { DailyObservation, DbStatus, Snapshot } from "./db";

export { EVENTS };

interface StoreValue {
  hydrated: boolean;
  dbStatus: DbStatus;
  profile: Profile;
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
  closeOutToday: (guestsServed: number) => Promise<number>;
  setScenario: (patch: Partial<Scenario>) => void;
  resetDemo: () => Promise<void>;
  startOwnRestaurant: (p: Profile, ingredients: Ingredient[]) => void;
  backToDemo: () => void;
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
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEMO_INGREDIENTS);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [observations, setObservations] = useState<DailyObservation[]>([]);
  const [scenario, setScenarioState] = useState<Scenario>(DEFAULT_SCENARIO);
  const [days, setDays] = useState<DayWeather[]>([]);
  const [weatherSource, setWeatherSource] = useState<"live" | "offline" | "loading">("loading");
  const remote = useRef(false); // true only for the verified owner on the demo restaurant

  const apply = (s: Snapshot) => {
    setIngredients(s.ingredients);
    setLogs(s.logs);
    setObservations(s.observations);
  };

  useEffect(() => {
    (async () => {
      const token = readAdminToken();
      setAdminToken(token);
      const p = loadProfile();
      setProfile(p);

      if (!p.isDemo) {
        // A visitor's own restaurant lives only on their device.
        apply(db.loadLocal(p.id) ?? { ingredients: [], logs: [], observations: [] });
        setDbStatus("sandbox");
      } else {
        const [isAdmin, snap] = await Promise.all([token ? db.verifyAdmin().catch(() => false) : false, db.loadRemote().catch(() => null)]);
        if (isAdmin) {
          remote.current = true;
          if (snap && snap.ingredients.length > 0) apply(snap);
          else {
            const seed = demoSnapshot();
            apply(seed);
            await db.writeSnapshot(seed);
          }
          setDbStatus("connected");
        } else {
          // Public visitor: start from the shared demo, keep their edits private.
          apply(db.loadLocal(p.id) ?? (snap && snap.ingredients.length > 0 ? snap : demoSnapshot()));
          setDbStatus(snap ? "sandbox" : "local");
        }
      }
      setHydrated(true);

      fetch(`/api/weather?lat=${p.lat}&lng=${p.lng}`)
        .then((r) => r.json())
        .then((d: { source: "live" | "offline"; days: DayWeather[] }) => {
          setDays(d.days);
          setWeatherSource(d.source);
        })
        .catch(() => {
          setDays(fallbackWeek());
          setWeatherSource("offline");
        });
    })();
  }, []);

  // Visitors' changes are saved on their device; the owner's go to Supabase.
  useEffect(() => {
    if (hydrated && !remote.current) db.saveLocal(profile.id, { ingredients, logs, observations });
  }, [hydrated, profile.id, ingredients, logs, observations]);

  const sync = useCallback((write: () => Promise<boolean> | undefined) => {
    if (!remote.current) return;
    write()?.then((ok) => !ok && setDbStatus("local")).catch(() => setDbStatus("local"));
  }, []);

  const setScenario = useCallback((patch: Partial<Scenario>) => setScenarioState((s) => ({ ...s, ...patch })), []);
  const learningObs = useMemo(() => db.toLearningObs(observations), [observations]);
  const src = weatherSource === "live" ? "live" : "offline";
  const base = { cuisineType: profile.cuisineType, avgCovers: profile.avgCovers };

  const today = useMemo(() => {
    if (!days[0]) return null;
    const date = parseLocalDate(days[0].date);
    return buildDayForecast({ ...base, ingredients, observations: learningObs, expectedCovers: profile.coversByDay[date.getDay()], weather: days[0], weatherSource: src, event: EVENTS.none, date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, ingredients, learningObs, src, profile]);

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
        ...base,
        ingredients,
        observations: learningObs,
        expectedCovers: isSel && scenario.coversOverride !== null ? scenario.coversOverride : profile.coversByDay[date.getDay()],
        weather: over ? { ...day, condition: cond, description: describe(cond, day.tempF) } : day,
        weatherSource: over ? "override" : src,
        event: isSel ? EVENTS[scenario.event] : EVENTS.none,
        date,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, ingredients, learningObs, scenario, src, profile]);

  const selected = useMemo(() => week.find((d) => d.date === scenario.selectedDate) ?? week[0] ?? null, [week, scenario.selectedDate]);

  // Tonight's close-out: today's logs per ingredient become one observation each.
  // The prior is recomputed for the guests who actually came, so a busy
  // walk-in night isn't learned as a kitchen habit.
  const closeOutToday = useCallback(
    async (guestsServed: number) => {
      if (!today) return 0;
      const date = parseLocalDate(today.date);
      const isToday = (l: WasteLog) => localISO(new Date(l.loggedAt)) === today.date;
      const rows: DailyObservation[] = today.ingredients.map((p) => ({
        date: today.date,
        ingredientId: p.ingredient.id,
        priorKg:
          Math.round(
            priorWasteKg({ ingredient: p.ingredient, expectedCovers: guestsServed, avgCovers: profile.avgCovers, weather: today.weather, weatherSource: src, date, event: EVENTS.none, cuisineType: profile.cuisineType }) * 1000
          ) / 1000,
        cutKg: p.cutKg,
        loggedKg: Math.round(logs.filter((l) => isToday(l) && l.ingredientId === p.ingredient.id).reduce((s, l) => s + l.quantityKg, 0) * 1000) / 1000,
        weather: today.weather.condition,
        covers: guestsServed,
      }));
      setObservations((prev) => [...prev.filter((o) => o.date !== today.date), ...rows]);
      sync(() => db.upsertObservations(rows));
      return rows.length;
    },
    [today, logs, sync, src, profile]
  );

  const value: StoreValue = {
    hydrated, dbStatus, profile, ingredients, logs, observations, scenario, weatherSource, today, week, selected,
    addIngredient: (i) => { setIngredients((p) => [...p, i]); sync(() => db.upsertIngredient(i)); },
    updateIngredient: (i) => { setIngredients((p) => p.map((x) => (x.id === i.id ? i : x))); sync(() => db.upsertIngredient(i)); },
    removeIngredient: (id) => {
      setIngredients((p) => p.filter((x) => x.id !== id));
      setLogs((p) => p.filter((x) => x.ingredientId !== id));
      setObservations((p) => p.filter((x) => x.ingredientId !== id));
      sync(() => db.deleteIngredient(id));
    },
    addLog: (l) => { setLogs((p) => [l, ...p]); sync(() => db.insertLog(l)); },
    removeLog: (id) => { setLogs((p) => p.filter((x) => x.id !== id)); sync(() => db.deleteLog(id)); },
    closeOutToday,
    setScenario,
    resetDemo: async () => {
      setScenarioState(DEFAULT_SCENARIO);
      if (!profile.isDemo) {
        apply({ ingredients, logs: [], observations: [] });
        return;
      }
      const seed = demoSnapshot();
      if (remote.current) {
        apply(seed);
        await db.wipeRemote();
        sync(() => db.writeSnapshot(seed));
      } else {
        db.clearLocal(profile.id);
        const snap = await db.loadRemote().catch(() => null);
        apply(snap && snap.ingredients.length > 0 ? snap : seed);
      }
    },
    // Full reload so weather, history and learning all restart for the new kitchen.
    startOwnRestaurant: (p, items) => {
      saveProfile(p);
      db.saveLocal(p.id, { ingredients: items, logs: [], observations: [] });
      window.location.assign("/dashboard");
    },
    backToDemo: () => {
      clearProfile();
      window.location.assign("/dashboard");
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
