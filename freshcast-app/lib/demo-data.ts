// Marco's Trattoria — the demo restaurant for FreshCast.
// Boston, MA. 60-seat independent Italian restaurant.
// CO2 factors (kg CO2e per kg food wasted) sourced from FAO/WRAP datasets.

import { Restaurant, Ingredient, WasteLog } from "./types";

export const DEMO_RESTAURANT: Restaurant = {
  id: "marcos-trattoria",
  name: "Marco's Trattoria",
  address: "214 Hanover St, Boston, MA 02113",
  lat: 42.3647,
  lng: -71.0542,
  cuisineType: "italian",
};

// Average covers per day of week, learned from historical data.
export const AVG_COVERS = 52;

export const DEMO_INGREDIENTS: Ingredient[] = [
  { id: "arugula", name: "Arugula", costPerKg: 12.5, baselinePrepKg: 4.0, co2PerKg: 2.0 },
  { id: "salmon", name: "Salmon", costPerKg: 28.0, baselinePrepKg: 6.0, co2PerKg: 11.9 },
  { id: "mozzarella", name: "Fresh Mozzarella", costPerKg: 16.0, baselinePrepKg: 5.0, co2PerKg: 8.6 },
  { id: "tomatoes", name: "San Marzano Tomatoes", costPerKg: 6.5, baselinePrepKg: 8.0, co2PerKg: 2.1 },
  { id: "basil", name: "Fresh Basil", costPerKg: 22.0, baselinePrepKg: 1.5, co2PerKg: 2.0 },
  { id: "pasta-dough", name: "Fresh Pasta Dough", costPerKg: 4.0, baselinePrepKg: 10.0, co2PerKg: 1.4 },
  { id: "prosciutto", name: "Prosciutto", costPerKg: 42.0, baselinePrepKg: 3.0, co2PerKg: 12.3 },
  { id: "bread", name: "Focaccia Bread", costPerKg: 3.5, baselinePrepKg: 12.0, co2PerKg: 1.3 },
];

// Tomorrow's conditions for the demo — a rainy Tuesday, the highest-waste
// combination (Tuesday 1.22x day factor + rain 1.15x weather).
export const DEMO_TOMORROW = {
  expectedCovers: 45,
  weatherCondition: "rain" as const,
  tempF: 58,
  weatherDescription: "Rainy, 58°F",
};

// Running totals shown on the dashboard (accumulated since FreshCast started).
export const DEMO_RUNNING_TOTALS = {
  savedThisMonth: 1240,
  co2PreventedKg: 48,
  wasteBeforeMonthly: 1800,
  wasteAfterMonthly: 340,
};

// 3 weeks of waste history showing a downward trend after FreshCast adoption.
// Week 1 = before recommendations, Weeks 2-3 = improving as the model learns.
export function generateWasteHistory(): { date: string; wasteCost: number }[] {
  const history: { date: string; wasteCost: number }[] = [];
  const today = new Date();
  // 21 days ago to yesterday
  const trend = [
    // Week 1 — before FreshCast, high and erratic
    92, 88, 101, 85, 79, 64, 58,
    // Week 2 — recommendations applied, dropping
    71, 66, 68, 59, 52, 44, 41,
    // Week 3 — model calibrated, consistently low
    48, 43, 45, 38, 34, 31, 29,
  ];
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (21 - i));
    history.push({
      date: d.toISOString().split("T")[0],
      wasteCost: trend[i],
    });
  }
  return history;
}

// Seed waste logs for "last week same day" recency signal.
export function generateLastWeekLogs(): WasteLog[] {
  const logs: WasteLog[] = [];
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 6);
  const iso = lastWeek.toISOString();
  // Last week, same weekday, Marco wasted these amounts
  const lastWeekWaste: Record<string, number> = {
    arugula: 0.9,
    salmon: 1.1,
    mozzarella: 0.7,
    tomatoes: 1.4,
    basil: 0.3,
    "pasta-dough": 1.8,
    prosciutto: 0.4,
    bread: 2.2,
  };
  let idx = 0;
  for (const [ingredientId, quantityKg] of Object.entries(lastWeekWaste)) {
    logs.push({
      id: `lw-${idx++}`,
      ingredientId,
      quantityKg,
      loggedAt: iso,
    });
  }
  return logs;
}
