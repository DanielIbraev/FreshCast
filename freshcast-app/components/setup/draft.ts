// Wizard state, validation and the final Profile/Ingredient build.
// Numbers are kept as strings while editing so fields can be cleared.

import { Category, CuisineType, Ingredient, ServiceStyle } from "@/lib/types";
import { STAPLES, toIngredient } from "@/lib/staples";
import { CATEGORIES } from "@/lib/categories";
import { Profile, averageOpen, weeklyShape } from "@/lib/profile";

export type AutoField = "name" | "address" | "cuisine" | "service" | "openDays";

export interface PlaceResult {
  osmId: string;
  name: string;
  address: string;
  place: string;
  lat: number;
  lng: number;
  osmType: string;
  cuisineTag: string | null;
  cuisineType: CuisineType;
  openingHours: string | null;
  openDays: boolean[];
  service: ServiceStyle | null;
  phone: string | null;
  website: string | null;
}

export interface PrepRow {
  key: string;
  name: string;
  category: Category;
  prep: string;
  cost: string;
  shelf: string;
  on: boolean;
  custom: boolean;
}

export interface Draft {
  name: string;
  address: string;
  loc: { lat: number; lng: number; place: string; from: "search" | "geocode" } | null;
  cuisineType: CuisineType;
  cuisineLabel: string;
  service: ServiceStyle;
  openDays: boolean[];
  seats: string;
  avg: string;
  imported: number[] | null; // guests by weekday from a POS export
  rows: PrepRow[];
  osmId?: string;
  phone?: string;
  website?: string;
  auto: AutoField[];
}

export const SERVICE_LABELS: Record<ServiceStyle, string> = {
  breakfast_lunch: "Breakfast & lunch",
  lunch: "Lunch",
  dinner: "Dinner",
  all_day: "All day",
};

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let seq = 0;
const key = () => `r${++seq}`;

export function stapleRows(c: CuisineType): PrepRow[] {
  return STAPLES[c].map((s) => ({ key: key(), name: s.name, category: s.category, prep: String(s.baselinePrepKg), cost: String(s.costPerKg), shelf: String(s.shelfLifeDays), on: true, custom: false }));
}

export function customRow(): PrepRow {
  return { key: key(), name: "", category: "produce", prep: "1", cost: "", shelf: "3", on: true, custom: true };
}

export function emptyDraft(): Draft {
  return {
    name: "", address: "", loc: null, cuisineType: "american", cuisineLabel: "", service: "dinner",
    openDays: Array(7).fill(true), seats: "50", avg: "60", imported: null, rows: stapleRows("american"), auto: [],
  };
}

// "seafood;american" → "Seafood, American"
const humanize = (tag: string) => tag.split(/[;,]/).map((t) => t.trim().replace(/_/g, " ")).filter(Boolean).map((t) => t[0].toUpperCase() + t.slice(1)).join(", ");

export function fromPlace(d: Draft, p: PlaceResult): Draft {
  const auto: AutoField[] = ["name", "address", "cuisine"];
  if (p.openingHours) auto.push("openDays");
  if (p.service) auto.push("service");
  return {
    ...d,
    name: p.name,
    address: p.address,
    loc: { lat: p.lat, lng: p.lng, place: p.place, from: "search" },
    cuisineType: p.cuisineType,
    cuisineLabel: p.cuisineTag ? humanize(p.cuisineTag).slice(0, 60) : "",
    service: p.service ?? d.service,
    openDays: p.openingHours ? p.openDays : d.openDays,
    rows: [...stapleRows(p.cuisineType), ...d.rows.filter((r) => r.custom)],
    osmId: p.osmId,
    phone: p.phone ?? undefined,
    website: p.website ?? undefined,
    auto,
  };
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));
export const positive = (s: string) => Number.isFinite(num(s)) && num(s) > 0;

// Guests by weekday as the forecast will see them (closed days = 0).
export function guestsByDay(d: Draft): number[] {
  const avg = Math.max(1, Math.round(num(d.avg) || 1));
  const base = d.imported ?? weeklyShape(avg, d.service, d.openDays);
  return base.map((c, i) => (d.openDays[i] ? c : 0));
}

export const dailyPrepCost = (rows: PrepRow[]) =>
  rows.filter((r) => r.on && positive(r.prep) && positive(r.cost)).reduce((s, r) => s + num(r.prep) * num(r.cost), 0);

export type Errors = Partial<Record<string, string>>;

export function validate(step: number, d: Draft): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!d.name.trim()) e.name = "What's the restaurant called?";
    if (!d.loc) e.address = "Press Find so we can pull the weather for your street.";
    if (!d.openDays.some(Boolean)) e.openDays = "Pick at least one day you're open.";
    const seats = num(d.seats);
    if (!(Number.isInteger(seats) && seats >= 1 && seats <= 2000)) e.seats = "A whole number from 1 to 2,000.";
  }
  if (step === 2) {
    const avg = num(d.avg);
    if (!(avg >= 5 && avg <= 5000)) e.avg = "Between 5 and 5,000 guests.";
  }
  if (step === 3) {
    const on = d.rows.filter((r) => r.on);
    if (!on.length) e.rows = "Keep at least one item. You can add more later in Kitchen.";
    for (const r of on) {
      if (r.custom && !r.name.trim()) e[`${r.key}.name`] = "Name";
      if (!positive(r.prep)) e[`${r.key}.prep`] = "Prep";
      if (!positive(r.cost)) e[`${r.key}.cost`] = "Price";
      if (!positive(r.shelf)) e[`${r.key}.shelf`] = "Shelf life";
    }
    if (!e.rows && Object.keys(e).length) e.rows = "Fix the highlighted fields. Every number needs to be above zero.";
  }
  return e;
}

export function buildProfile(d: Draft): Profile {
  const byDay = guestsByDay(d);
  const seats = Math.round(num(d.seats));
  return {
    id: `own-${Date.now().toString(36)}`,
    name: d.name.trim().slice(0, 80),
    address: d.address.trim().slice(0, 200),
    place: d.loc?.place ?? "",
    lat: d.loc?.lat ?? 0,
    lng: d.loc?.lng ?? 0,
    cuisineType: d.cuisineType,
    cuisineLabel: d.cuisineLabel.trim().slice(0, 60) || undefined,
    service: d.service,
    openDays: d.openDays,
    seats,
    avgCovers: averageOpen(byDay, d.openDays),
    coversByDay: byDay,
    coversSource: d.imported ? "pos-import" : "default",
    isDemo: false,
    tagline: `${seats} seats · ${SERVICE_LABELS[d.service].toLowerCase()}`,
    osmId: d.osmId,
    phone: d.phone,
    website: d.website,
  };
}

export function buildIngredients(d: Draft): Ingredient[] {
  return d.rows
    .filter((r) => r.on)
    .map((r) => {
      const fields = { name: r.name.trim().slice(0, 60), category: r.category, costPerKg: num(r.cost), baselinePrepKg: num(r.prep), shelfLifeDays: num(r.shelf) };
      if (!r.custom) return toIngredient(fields);
      return { ...fields, id: `${fields.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`, co2PerKg: CATEGORIES[r.category].co2PerKg };
    });
}
