"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DayPrediction, DayWeather, Ingredient, Scenario, WasteLog } from "./types";
import { EVENTS, parseLocalDate, localISO } from "./demo-data";
import { buildDayForecast } from "./forecast";
import { describe, fallbackWeek } from "./weather";
import { priorWasteKg } from "./prediction";
import { runBacktest } from "./backtest";
import { residuals, withRanges } from "./uncertainty";
import { DEMO_PROFILE, DEMO_PROFILES, Profile, getProfile, loadProfile, saveProfile, setActive, ownProfiles } from "./profile";
import { kitchenFor, seedTodayLogs, shapeOf, isOpen } from "./kitchens";
import { readAdminToken } from "./admin";
import { RESTAURANT_ID, setAdminToken } from "./supabase";
import * as db from "./db";
import { DailyObservation, DbStatus, Snapshot } from "./db";

export { EVENTS };

interface StoreValue {
  hydrated: boolean;
  ready: boolean; // data and weather loaded: safe to show the page without it shifting
  dbStatus: DbStatus;
  profile: Profile;
  restaurants: Profile[]; // demos first, then the visitor's own
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
  switchRestaurant: (id: string) => void;
  startOwnRestaurant: (p: Profile, ingredients: Ingredient[]) => void;
  backToDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const DEFAULT_SCENARIO: Scenario = { selectedDate: null, coversOverride: null, weatherOverride: "live", event: "none" };

// A demo kitchen's history: 12 weeks of simulated nightly close-outs. For the
// first 14 open days it only logged (FreshCast watching); after that it
// prepped to the plan. Same seed every time, so the story is repeatable.
function demoSnapshot(p: Profile): Snapshot {
  const k = kitchenFor(p.id);
  const bt = runBacktest(k.ingredients, 12, 7, new Date(), 14, shapeOf(p));
  return { ingredients: k.ingredients, logs: seedTodayLogs(p.id), observations: bt.closeouts };
}

const weatherCache = new Map<string, Promise<{ source: "live" | "offline"; days: DayWeather[] }>>();
function fetchWeather(lat: number, lng: number) {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (!weatherCache.has(key)) {
    weatherCache.set(
      key,
      fetch(`/api/weather?lat=${lat}&lng=${lng}`)
        .then((r) => r.json())
        .catch(() => ({ source: "offline" as const, days: fallbackWeek() }))
    );
  }
  return weatherCache.get(key)!;
}

const isToday = (iso: string) => (l: WasteLog) => localISO(new Date(l.loggedAt)) === iso;
// Only over-prep and spoilage say anything about how much to prep. Plate
// waste and drops are kept in the log but not learned from.
const LEARNABLE = new Set(["overprep", "spoiled"]);

// `only` pins the store to one restaurant (the pitch deck always shows Marco's).
export function StoreProvider({ children, only }: { children: React.ReactNode; only?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatus>("loading");
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [restaurants, setRestaurants] = useState<Profile[]>(DEMO_PROFILES);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [observations, setObservations] = useState<DailyObservation[]>([]);
  const [scenario, setScenarioState] = useState<Scenario>(DEFAULT_SCENARIO);
  const [days, setDays] = useState<DayWeather[]>([]);
  const [weatherSource, setWeatherSource] = useState<"live" | "offline" | "loading">("loading");
  const remote = useRef(false); // true only for the verified owner on Marco's (the Supabase restaurant)
  const loadSeq = useRef(0);

  const apply = (s: Snapshot) => {
    setIngredients(s.ingredients);
    setLogs(s.logs);
    setObservations(s.observations);
  };

  const activate = useCallback(async (p: Profile) => {
    const seq = ++loadSeq.current;
    setHydrated(false);
    setProfile(p);
    setScenarioState(DEFAULT_SCENARIO);
    setActive(p.id);
    setRestaurants([...DEMO_PROFILES.map((d) => getProfile(d.id) ?? d), ...ownProfiles()]);
    remote.current = false;

    let snap: Snapshot;
    let status: DbStatus;
    if (!p.isDemo) {
      // A visitor's own restaurant lives only on their device.
      snap = db.loadLocal(p.id) ?? { ingredients: [], logs: [], observations: [] };
      status = "sandbox";
    } else if (p.id === RESTAURANT_ID) {
      // Marco's is stored in Supabase. Only the verified owner writes to it.
      const token = readAdminToken();
      setAdminToken(token);
      const [isAdmin, stored] = await Promise.all([token ? db.verifyAdmin().catch(() => false) : false, db.loadRemote().catch(() => null)]);
      const has = stored && stored.ingredients.length > 0;
      if (isAdmin) {
        remote.current = true;
        snap = has ? stored : demoSnapshot(p);
        if (!has) await db.writeSnapshot(snap);
        status = "connected";
      } else {
        snap = db.loadLocal(p.id) ?? (has ? stored : demoSnapshot(p));
        status = stored ? "sandbox" : "local";
      }
    } else {
      // The other demo kitchens are generated on this device from the same simulator.
      snap = db.loadLocal(p.id) ?? demoSnapshot(p);
      status = "sandbox";
    }
    if (seq !== loadSeq.current) return; // a newer switch started
    apply(snap);
    setDbStatus(status);
    setHydrated(true);

    setWeatherSource("loading");
    const w = await fetchWeather(p.lat, p.lng);
    if (seq !== loadSeq.current) return;
    setDays(w.days?.length ? w.days : fallbackWeek());
    setWeatherSource(w.days?.length ? w.source : "offline");
  }, []);

  // ?r=<restaurant id> opens a specific kitchen (used by the pitch deck links).
  useEffect(() => {
    const asked = only ?? new URLSearchParams(window.location.search).get("r");
    const p = (asked && getProfile(asked)) || loadProfile();
    if (only) {
      // Don't change which restaurant the app opens to next time.
      const prev = localStorage.getItem("freshcast:active");
      activate(p).then(() => prev && setActive(prev));
    } else activate(p);
  }, [activate, only]);

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
  const resid = useMemo(() => residuals(learningObs, new Map(ingredients.map((i) => [i.id, i.costPerKg]))), [learningObs, ingredients]);
  const src = weatherSource === "live" ? "live" : "offline";

  const forecastFor = useCallback(
    (day: DayWeather, opts: { covers?: number | null; weather?: DayWeather; weatherSource?: "live" | "override" | "offline"; event?: keyof typeof EVENTS }) => {
      const date = parseLocalDate(day.date);
      const usual = profile.coversByDay[date.getDay()] ?? 0;
      const open = isOpen(profile, date.getDay());
      const covers = opts.covers ?? usual;
      return withRanges(
        buildDayForecast({
          cuisineType: profile.cuisineType,
          avgCovers: profile.avgCovers,
          usualCovers: usual,
          open,
          coversSource: profile.coversSource,
          guestsSource: opts.covers != null ? "what-if" : "usual",
          ingredients,
          observations: learningObs,
          expectedCovers: covers,
          weather: opts.weather ?? day,
          weatherSource: opts.weatherSource ?? src,
          event: EVENTS[opts.event ?? "none"],
          date,
        }),
        resid
      );
    },
    [profile, ingredients, learningObs, resid, src]
  );

  const today = useMemo(() => (days[0] ? forecastFor(days[0], {}) : null), [days, forecastFor]);

  const week = useMemo(() => {
    const forecastDays = days.slice(1);
    if (!forecastDays.length) return [];
    const firstOpen = forecastDays.find((d) => isOpen(profile, parseLocalDate(d.date).getDay())) ?? forecastDays[0];
    const selDate = scenario.selectedDate ?? firstOpen.date;
    return forecastDays.map((day) => {
      if (day.date !== selDate) return forecastFor(day, {});
      const over = scenario.weatherOverride !== "live";
      const cond = over ? (scenario.weatherOverride as DayWeather["condition"]) : day.condition;
      return forecastFor(day, {
        covers: scenario.coversOverride,
        weather: over ? { ...day, condition: cond, description: describe(cond, day.tempF) } : day,
        weatherSource: over ? "override" : src,
        event: scenario.event,
      });
    });
  }, [days, scenario, src, forecastFor, profile]);

  const selected = useMemo(() => {
    const open = week.filter((d) => !d.closed);
    return week.find((d) => d.date === scenario.selectedDate) ?? open[0] ?? week[0] ?? null;
  }, [week, scenario.selectedDate]);

  // Tonight's close-out: today's over-prep + spoilage logs per ingredient
  // become one observation each. The prior is recomputed for the guests who
  // actually came, so a busy walk-in night isn't learned as a kitchen habit.
  const closeOutToday = useCallback(
    async (guestsServed: number) => {
      if (!today || today.closed) return 0;
      const date = parseLocalDate(today.date);
      const todays = logs.filter(isToday(today.date));
      const rows: DailyObservation[] = today.ingredients.map((p) => ({
        date: today.date,
        ingredientId: p.ingredient.id,
        priorKg:
          Math.round(
            priorWasteKg({
              ingredient: p.ingredient,
              expectedCovers: guestsServed,
              usualCovers: today.usualCovers,
              avgCovers: profile.avgCovers,
              weather: today.weather,
              weatherSource: src,
              date,
              event: EVENTS.none,
              cuisineType: profile.cuisineType,
            }) * 1000
          ) / 1000,
        cutKg: p.cutKg,
        loggedKg: Math.round(todays.filter((l) => l.ingredientId === p.ingredient.id && LEARNABLE.has(l.reason)).reduce((s, l) => s + l.quantityKg, 0) * 1000) / 1000,
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
    hydrated, ready: hydrated && weatherSource !== "loading", dbStatus, profile, restaurants, ingredients, logs, observations, scenario, weatherSource, today, week, selected,
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
      const seed = demoSnapshot(profile);
      if (remote.current) {
        apply(seed);
        await db.wipeRemote();
        sync(() => db.writeSnapshot(seed));
      } else {
        db.clearLocal(profile.id);
        await activate(profile);
      }
    },
    switchRestaurant: (id) => {
      const p = getProfile(id);
      if (p && p.id !== profile.id) activate(p);
    },
    startOwnRestaurant: (p, items) => {
      saveProfile(p);
      db.saveLocal(p.id, { ingredients: items, logs: [], observations: [] });
      setActive(p.id);
      window.location.assign("/dashboard"); // fresh start on the new kitchen's forecast
    },
    backToDemo: () => activate(getProfile(DEMO_PROFILE.id) ?? DEMO_PROFILE),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
