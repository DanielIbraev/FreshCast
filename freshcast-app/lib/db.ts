// Data access. Supabase is the source of truth; if it's unreachable or the
// tables don't exist yet, the app falls back to browser storage so a demo
// never shows an error screen.

import { supabase, RESTAURANT_ID } from "./supabase";
import { Ingredient, WasteLog, Category, WasteReason } from "./types";
import { Observation } from "./learning";

export interface DailyObservation {
  date: string;
  ingredientId: string;
  priorKg: number;
  cutKg: number;
  loggedKg: number;
  weather: string;
  covers: number;
}

export interface Snapshot {
  ingredients: Ingredient[];
  logs: WasteLog[];
  observations: DailyObservation[];
}

export type DbStatus = "connected" | "local" | "loading";

type IngredientRow = { id: string; name: string; category: Category; cost_per_kg: number; baseline_prep_kg: number; shelf_life_days: number; co2_per_kg: number };
type LogRow = { id: string; ingredient_id: string; quantity_kg: number; reason: WasteReason; logged_at: string };
type ObsRow = { date: string; ingredient_id: string; prior_kg: number; cut_kg: number; logged_kg: number; weather: string; covers: number };

const toIngredient = (r: IngredientRow): Ingredient => ({
  id: r.id,
  name: r.name,
  category: r.category,
  costPerKg: Number(r.cost_per_kg),
  baselinePrepKg: Number(r.baseline_prep_kg),
  shelfLifeDays: r.shelf_life_days,
  co2PerKg: Number(r.co2_per_kg),
});
const fromIngredient = (i: Ingredient) => ({
  id: i.id,
  restaurant_id: RESTAURANT_ID,
  name: i.name,
  category: i.category,
  cost_per_kg: i.costPerKg,
  baseline_prep_kg: i.baselinePrepKg,
  shelf_life_days: i.shelfLifeDays,
  co2_per_kg: i.co2PerKg,
});
const toLog = (r: LogRow): WasteLog => ({ id: r.id, ingredientId: r.ingredient_id, quantityKg: Number(r.quantity_kg), reason: r.reason, loggedAt: r.logged_at });
const toObs = (r: ObsRow): DailyObservation => ({
  date: r.date,
  ingredientId: r.ingredient_id,
  priorKg: Number(r.prior_kg),
  cutKg: Number(r.cut_kg),
  loggedKg: Number(r.logged_kg),
  weather: r.weather,
  covers: r.covers,
});
const fromObs = (o: DailyObservation) => ({
  restaurant_id: RESTAURANT_ID,
  date: o.date,
  ingredient_id: o.ingredientId,
  prior_kg: o.priorKg,
  cut_kg: o.cutKg,
  logged_kg: o.loggedKg,
  weather: o.weather,
  covers: o.covers,
});

// What the learning layer consumes: "usual" waste = binned + what the plan cut.
export function toLearningObs(obs: DailyObservation[]): Observation[] {
  return obs.map((o) => ({ date: o.date, ingredientId: o.ingredientId, rawKg: o.priorKg, usualKg: o.loggedKg + o.cutKg, condition: o.weather }));
}

export async function loadRemote(): Promise<Snapshot | null> {
  if (!supabase) return null;
  const since = new Date(Date.now() - 120 * 86_400_000).toISOString();
  const [ing, logs, obs] = await Promise.all([
    supabase.from("ingredients").select("*").eq("restaurant_id", RESTAURANT_ID).order("created_at"),
    supabase.from("waste_logs").select("*").eq("restaurant_id", RESTAURANT_ID).gte("logged_at", since).order("logged_at", { ascending: false }),
    supabase.from("daily_observations").select("*").eq("restaurant_id", RESTAURANT_ID).order("date"),
  ]);
  if (ing.error || logs.error || obs.error) return null;
  return {
    ingredients: (ing.data as IngredientRow[]).map(toIngredient),
    logs: (logs.data as LogRow[]).map(toLog),
    observations: (obs.data as ObsRow[]).map(toObs),
  };
}

// Writes are fire-and-forget from the UI's view; failures surface in the status pill.
export async function writeSnapshot(s: Snapshot): Promise<boolean> {
  if (!supabase) return false;
  const a = await supabase.from("ingredients").upsert(s.ingredients.map(fromIngredient));
  if (a.error) return false;
  const b = s.logs.length
    ? await supabase.from("waste_logs").upsert(s.logs.map((l) => ({ id: l.id, restaurant_id: RESTAURANT_ID, ingredient_id: l.ingredientId, quantity_kg: l.quantityKg, reason: l.reason, logged_at: l.loggedAt })))
    : { error: null };
  const c = s.observations.length ? await supabase.from("daily_observations").upsert(s.observations.map(fromObs)) : { error: null };
  return !b.error && !c.error;
}

export async function upsertIngredient(i: Ingredient) {
  return !(await supabase?.from("ingredients").upsert(fromIngredient(i)))?.error;
}
export async function deleteIngredient(id: string) {
  return !(await supabase?.from("ingredients").delete().eq("id", id).eq("restaurant_id", RESTAURANT_ID))?.error;
}
export async function insertLog(l: WasteLog) {
  return !(await supabase?.from("waste_logs").insert({ id: l.id, restaurant_id: RESTAURANT_ID, ingredient_id: l.ingredientId, quantity_kg: l.quantityKg, reason: l.reason, logged_at: l.loggedAt }))?.error;
}
export async function deleteLog(id: string) {
  return !(await supabase?.from("waste_logs").delete().eq("id", id).eq("restaurant_id", RESTAURANT_ID))?.error;
}
export async function upsertObservations(obs: DailyObservation[]) {
  return !(await supabase?.from("daily_observations").upsert(obs.map(fromObs)))?.error;
}
export async function wipeRemote() {
  if (!supabase) return;
  // waste_logs and daily_observations cascade from ingredients
  await supabase.from("ingredients").delete().eq("restaurant_id", RESTAURANT_ID);
}

const LOCAL_KEY = "freshcast:v3";
export function loadLocal(): Snapshot | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}
export function saveLocal(s: Snapshot) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
}
