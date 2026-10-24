// The restaurant FreshCast is forecasting for. Three demo restaurants of very
// different types ship with the app; anyone can add their own (saved on their
// device only).

import { CuisineType, ServiceStyle } from "./types";

export interface Profile {
  id: string;
  name: string;
  address: string;
  place: string; // short label, e.g. "North End, Boston"
  lat: number;
  lng: number;
  cuisineType: CuisineType;
  cuisineLabel?: string; // free text, e.g. "Neapolitan pizza"
  service: ServiceStyle;
  openDays: boolean[]; // 0 = Sunday
  seats: number;
  avgCovers: number;
  coversByDay: number[]; // guests by weekday, 0 = Sunday (0 on closed days)
  coversSource: "default" | "pos-import";
  isDemo: boolean;
  tagline?: string; // one line for the restaurant switcher
  osmId?: string;
  phone?: string;
  website?: string;
}

const ALL_DAYS = [true, true, true, true, true, true, true];

export const DEMO_PROFILES: Profile[] = [
  {
    id: "marcos-trattoria",
    name: "Marco's Trattoria",
    address: "Hanover St, North End, Boston, MA (fictional)",
    place: "North End, Boston",
    lat: 42.3647,
    lng: -71.0542,
    cuisineType: "italian",
    cuisineLabel: "Italian trattoria",
    service: "dinner",
    openDays: ALL_DAYS,
    seats: 60,
    avgCovers: 52,
    coversByDay: [48, 38, 45, 50, 56, 68, 72],
    coversSource: "default",
    isDemo: true,
    tagline: "60-seat dinner spot, busiest on weekends",
  },
  {
    id: "golden-crumb",
    name: "Golden Crumb Café",
    address: "Highland Ave, Davis Square, Somerville, MA (fictional)",
    place: "Davis Square, Somerville",
    lat: 42.3967,
    lng: -71.1226,
    cuisineType: "cafe_bakery",
    cuisineLabel: "Café & bakery",
    service: "breakfast_lunch",
    openDays: ALL_DAYS,
    seats: 28,
    avgCovers: 151,
    coversByDay: [190, 120, 125, 130, 135, 150, 205],
    coversSource: "default",
    isDemo: true,
    tagline: "28-seat counter café that bakes daily and sells out by 2pm",
  },
  {
    id: "kendall-bowls",
    name: "Kendall Bowl Co.",
    address: "Broadway, Kendall Square, Cambridge, MA (fictional)",
    place: "Kendall Square, Cambridge",
    lat: 42.3629,
    lng: -71.0839,
    cuisineType: "fast_casual",
    cuisineLabel: "Fast-casual grain bowls",
    service: "lunch",
    openDays: [false, true, true, true, true, true, true],
    seats: 40,
    avgCovers: 286,
    coversByDay: [0, 330, 360, 365, 350, 290, 120],
    coversSource: "default",
    isDemo: true,
    tagline: "Office-lunch rush: 350 bowls a weekday, quiet weekends",
  },
];

export const DEMO_PROFILE = DEMO_PROFILES[0];

export function averageOpen(coversByDay: number[], openDays: boolean[]): number {
  const open = coversByDay.filter((_, i) => openDays[i]);
  return open.length ? Math.round(open.reduce((s, x) => s + x, 0) / open.length) : 0;
}

// Typical weekly shape scaled to an average, by service style. Lunch spots
// near offices are busiest midweek; dinner spots on weekends.
export function weeklyShape(avg: number, service: ServiceStyle = "dinner", openDays: boolean[] = ALL_DAYS): number[] {
  const shapes: Record<ServiceStyle, number[]> = {
    dinner: [0.92, 0.73, 0.87, 0.96, 1.08, 1.31, 1.38],
    all_day: [1.0, 0.8, 0.85, 0.9, 1.0, 1.2, 1.25],
    breakfast_lunch: [1.25, 0.8, 0.83, 0.86, 0.9, 0.99, 1.36],
    lunch: [0.45, 1.15, 1.25, 1.27, 1.22, 1.0, 0.42],
  };
  const raw = shapes[service].map((m, i) => (openDays[i] ? m : 0));
  const mean = raw.filter((_, i) => openDays[i]).reduce((s, x) => s + x, 0) / Math.max(1, openDays.filter(Boolean).length);
  return raw.map((m) => (m === 0 ? 0 : Math.max(1, Math.round((m / mean) * avg))));
}

// ---- persistence: which restaurant is active, plus any saved/edited profiles
const ACTIVE = "freshcast:active";
const SAVED = "freshcast:profiles";

function saved(): Record<string, Profile> {
  try {
    return JSON.parse(localStorage.getItem(SAVED) ?? "{}");
  } catch {
    return {};
  }
}

function valid(p: Profile | undefined): p is Profile {
  return !!p && typeof p.lat === "number" && Array.isArray(p.coversByDay) && Array.isArray(p.openDays);
}

export function getProfile(id: string): Profile | null {
  const s = saved()[id];
  if (valid(s)) return s;
  return DEMO_PROFILES.find((p) => p.id === id) ?? null;
}

export function loadProfile(): Profile {
  const id = localStorage.getItem(ACTIVE) ?? DEMO_PROFILE.id;
  return getProfile(id) ?? DEMO_PROFILE;
}

export function saveProfile(p: Profile) {
  localStorage.setItem(SAVED, JSON.stringify({ ...saved(), [p.id]: p }));
}

export function setActive(id: string) {
  localStorage.setItem(ACTIVE, id);
}

// Restaurants the visitor set up themselves.
export function ownProfiles(): Profile[] {
  return Object.values(saved()).filter((p) => valid(p) && !p.isDemo);
}

export function clearSavedDemo(id: string) {
  const s = saved();
  if (s[id]?.isDemo) {
    delete s[id];
    localStorage.setItem(SAVED, JSON.stringify(s));
  }
}
