// Marco's Trattoria: the demo restaurant. 60-seat independent Italian, Boston.

import { Restaurant, Ingredient, WasteLog, WasteReason } from "./types";

export const DEMO_RESTAURANT: Restaurant = {
  id: "marcos-trattoria",
  name: "Marco's Trattoria",
  address: "214 Hanover St, Boston, MA 02113",
  lat: 42.3647,
  lng: -71.0542,
  cuisineType: "italian",
};

export const AVG_COVERS = 52;

export const EVENTS: Record<EventType, NearbyEvent> = {
  none: { type: "none", name: "", distanceMiles: 0 },
  game: { type: "game", name: "Celtics at TD Garden", distanceMiles: 0.6 },
  concert: { type: "concert", name: "Concert at TD Garden", distanceMiles: 0.6 },
  festival: { type: "festival", name: "North End Feast", distanceMiles: 0.2 },
  graduation: { type: "graduation", name: "Suffolk commencement", distanceMiles: 0.8 },
};

// Expected covers by weekday, as a reservation integration would report them.
// Index 0 = Sunday.
export const COVERS_BY_DAY = [48, 38, 45, 50, 56, 68, 72];

// History values are what the model has learned from 3 weeks of Marco's logs.
// lastWeekRatio > 1 means Marco wasted more than forecast last week.
export const DEMO_INGREDIENTS: Ingredient[] = [
  { id: "arugula", name: "Arugula", category: "produce", costPerKg: 12.5, baselinePrepKg: 4, shelfLifeDays: 3, co2PerKg: 2.0, history: { lastWeekRatio: 1.24, calibration: 1.12, weeksOfData: 3 } },
  { id: "salmon", name: "Atlantic Salmon", category: "seafood", costPerKg: 28, baselinePrepKg: 6, shelfLifeDays: 2, co2PerKg: 11.9, history: { lastWeekRatio: 0.92, calibration: 0.95, weeksOfData: 3 } },
  { id: "mozzarella", name: "Fresh Mozzarella", category: "dairy", costPerKg: 16, baselinePrepKg: 5, shelfLifeDays: 5, co2PerKg: 8.6, history: { lastWeekRatio: 1.05, calibration: 1.02, weeksOfData: 3 } },
  { id: "tomatoes", name: "San Marzano Tomatoes", category: "produce", costPerKg: 6.5, baselinePrepKg: 8, shelfLifeDays: 6, co2PerKg: 2.1, history: { lastWeekRatio: 0.88, calibration: 0.91, weeksOfData: 3 } },
  { id: "basil", name: "Fresh Basil", category: "produce", costPerKg: 22, baselinePrepKg: 1.5, shelfLifeDays: 2, co2PerKg: 2.0, history: { lastWeekRatio: 1.31, calibration: 1.18, weeksOfData: 3 } },
  { id: "pasta", name: "Fresh Pasta Dough", category: "bakery", costPerKg: 4, baselinePrepKg: 10, shelfLifeDays: 2, co2PerKg: 1.4, history: { lastWeekRatio: 1.1, calibration: 1.06, weeksOfData: 3 } },
  { id: "prosciutto", name: "Prosciutto di Parma", category: "meat", costPerKg: 42, baselinePrepKg: 3, shelfLifeDays: 7, co2PerKg: 12.3, history: { lastWeekRatio: 0.97, calibration: 0.98, weeksOfData: 3 } },
  { id: "focaccia", name: "Focaccia", category: "bakery", costPerKg: 3.5, baselinePrepKg: 12, shelfLifeDays: 1, co2PerKg: 1.3, history: { lastWeekRatio: 1.15, calibration: 1.09, weeksOfData: 3 } },
];

export const DEMO_RUNNING_TOTALS = {
  savedThisMonth: 1240,
  co2PreventedKg: 48,
  wasteBeforeMonthly: 1800,
  wasteAfterMonthly: 340,
};

// 21 days of waste cost: high before FreshCast, falling after day 7.
export function generateWasteHistory(): { date: string; wasteCost: number }[] {
  const trend = [92, 88, 101, 85, 79, 64, 58, 71, 66, 68, 59, 52, 44, 41, 48, 43, 45, 38, 34, 31, 29];
  const today = new Date();
  return trend.map((wasteCost, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (21 - i));
    return { date: localISO(d), wasteCost };
  });
}

// A few logs from earlier today so the log screen and charts aren't empty.
export function seedTodayLogs(): WasteLog[] {
  const seed: [string, number, WasteReason, number][] = [
    ["focaccia", 1.2, "overprep", 9],
    ["arugula", 0.4, "spoiled", 10],
    ["salmon", 0.3, "plate", 13],
    ["basil", 0.15, "spoiled", 14],
  ];
  const now = new Date();
  return seed.map(([ingredientId, quantityKg, reason, hour], i) => {
    const t = new Date(now);
    t.setHours(hour, 10 + i * 7, 0, 0);
    return { id: `seed-${i}`, ingredientId, quantityKg, reason, loggedAt: t.toISOString() };
  });
}

export function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
