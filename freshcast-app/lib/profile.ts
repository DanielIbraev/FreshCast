// The restaurant FreshCast is forecasting for. Marco's Trattoria is the demo;
// anyone can set up their own (saved on their device only).

import { CuisineType } from "./types";
import { AVG_COVERS, COVERS_BY_DAY, DEMO_RESTAURANT } from "./demo-data";

export interface Profile {
  id: string;
  name: string;
  address: string;
  place: string; // short label, e.g. "North End, Boston"
  lat: number;
  lng: number;
  cuisineType: CuisineType;
  seats: number;
  avgCovers: number;
  coversByDay: number[]; // guests by weekday, 0 = Sunday
  coversSource: "default" | "pos-import";
  isDemo: boolean;
}

export const DEMO_PROFILE: Profile = {
  id: DEMO_RESTAURANT.id,
  name: DEMO_RESTAURANT.name,
  address: DEMO_RESTAURANT.address,
  place: "North End, Boston",
  lat: DEMO_RESTAURANT.lat,
  lng: DEMO_RESTAURANT.lng,
  cuisineType: DEMO_RESTAURANT.cuisineType,
  seats: 60,
  avgCovers: AVG_COVERS,
  coversByDay: COVERS_BY_DAY,
  coversSource: "default",
  isDemo: true,
};

// Typical weekly shape (quiet Monday, busy weekend) scaled to an average.
export function weeklyShape(avg: number): number[] {
  return COVERS_BY_DAY.map((c) => Math.max(1, Math.round((c / AVG_COVERS) * avg)));
}

const KEY = "freshcast:profile";

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEMO_PROFILE;
    const p = JSON.parse(raw) as Profile;
    return p && typeof p.lat === "number" && Array.isArray(p.coversByDay) ? p : DEMO_PROFILE;
  } catch {
    return DEMO_PROFILE;
  }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearProfile() {
  localStorage.removeItem(KEY);
}
