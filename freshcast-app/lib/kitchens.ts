// The three demo kitchens: menu, prep pars, and the hidden "true" behaviour
// the simulator uses to generate their history. The model never reads the
// `hidden` block; it has to learn the gap from close-out logs.
//
// CO2e per kg is farm-to-retail food emissions from Poore & Nemecek (2018),
// Science 360:987, as published by Our World in Data
// (ourworldindata.org/grapher/ghg-per-kg-poore). Mapping used per item:
// other vegetables 0.53, root vegetables 0.43, onions 0.50, tomatoes 2.09,
// other fruit 1.05, wheat & rye 1.57, rice 4.45, other pulses 1.79, tofu 3.16,
// milk 3.15, eggs 4.67, cheese 23.88, pig meat 12.31, poultry 9.87,
// farmed fish 13.63.

import { Ingredient, WasteLog, WasteReason, WeatherCondition } from "./types";
import { Profile } from "./profile";

export interface HiddenWorld {
  coversSlope: number; // model assumes 0.6
  weather: Record<WeatherCondition, number>; // model assumes rain/storm 1.15, hot 0.9, cold 1.08
  weekday: number[]; // habits beyond guest count, 0 = Sunday (model assumes none)
  ingredientBias: Record<string, number>; // the owner's over/under-prep per item
}

export interface DemoKitchen {
  ingredients: Ingredient[];
  hidden: HiddenWorld;
  todayLogs: [string, number, WasteReason, number][]; // id, kg, reason, hour
}

const i = (id: string, name: string, category: Ingredient["category"], costPerKg: number, baselinePrepKg: number, shelfLifeDays: number, co2PerKg: number): Ingredient => ({
  id,
  name,
  category,
  costPerKg,
  baselinePrepKg,
  shelfLifeDays,
  co2PerKg,
});

export const KITCHENS: Record<string, DemoKitchen> = {
  "marcos-trattoria": {
    ingredients: [
      i("arugula", "Arugula", "produce", 12.5, 4, 3, 0.53),
      i("salmon", "Atlantic Salmon", "seafood", 28, 6, 2, 13.63),
      i("mozzarella", "Fresh Mozzarella", "dairy", 16, 5, 5, 23.88),
      i("tomatoes", "San Marzano Tomatoes", "produce", 6.5, 8, 6, 2.09),
      i("basil", "Fresh Basil", "produce", 22, 1.5, 2, 0.53),
      i("pasta", "Fresh Pasta Dough", "bakery", 4, 10, 2, 1.57),
      i("prosciutto", "Prosciutto di Parma", "meat", 42, 3, 7, 12.31),
      i("focaccia", "Focaccia", "bakery", 3.5, 12, 1, 1.57),
    ],
    hidden: {
      coversSlope: 0.8,
      weather: { rain: 1.25, storm: 1.3, hot: 0.88, cold: 1.12, normal: 1.0 },
      weekday: [1.0, 1.15, 1.05, 1.0, 0.97, 0.92, 0.95], // Monday crew preps like it's Saturday
      ingredientBias: { arugula: 1.3, salmon: 0.85, mozzarella: 1.05, tomatoes: 0.8, basil: 1.4, pasta: 1.15, prosciutto: 0.95, focaccia: 1.25 },
    },
    todayLogs: [
      ["focaccia", 1.2, "overprep", 9],
      ["arugula", 0.4, "spoiled", 10],
      ["salmon", 0.3, "plate", 13],
      ["basil", 0.15, "spoiled", 14],
    ],
  },
  "golden-crumb": {
    ingredients: [
      i("gc-croissant", "Butter Croissants", "bakery", 9, 9, 1, 1.57),
      i("gc-sourdough", "Sourdough Loaves", "bakery", 5, 12, 2, 1.57),
      i("gc-muffin", "Blueberry Muffins", "bakery", 7, 6, 2, 1.57),
      i("gc-milk", "Whole Milk", "dairy", 1.6, 40, 7, 3.15),
      i("gc-eggs", "Eggs (boiled & scrambled)", "dairy", 5.5, 6, 3, 4.67),
      i("gc-avocado", "Avocado (cut)", "produce", 6, 5, 1, 1.05),
      i("gc-spinach", "Baby Spinach", "produce", 8, 3, 3, 0.53),
      i("gc-salmon", "Smoked Salmon", "seafood", 38, 1.5, 4, 13.63),
    ],
    hidden: {
      coversSlope: 0.9, // walk-in trade: a quiet morning leaves whole trays
      weather: { rain: 1.35, storm: 1.45, hot: 0.95, cold: 1.1, normal: 1.0 },
      weekday: [0.92, 1.1, 1.0, 1.0, 1.05, 1.12, 0.9], // bakes Friday for a weekend that starts Saturday
      ingredientBias: { "gc-croissant": 1.35, "gc-sourdough": 1.1, "gc-muffin": 1.25, "gc-milk": 0.7, "gc-eggs": 0.9, "gc-avocado": 1.3, "gc-spinach": 1.15, "gc-salmon": 0.85 },
    },
    todayLogs: [
      ["gc-croissant", 0.9, "overprep", 13],
      ["gc-muffin", 0.6, "overprep", 14],
      ["gc-avocado", 0.3, "spoiled", 11],
      ["gc-milk", 0.5, "dropped", 9],
    ],
  },
  "kendall-bowls": {
    ingredients: [
      i("kb-rice", "Jasmine Rice (cooked)", "dry", 1.5, 45, 1, 4.45),
      i("kb-chicken", "Grilled Chicken Thigh", "meat", 9, 26, 2, 9.87),
      i("kb-greens", "Mixed Greens", "produce", 7, 15, 2, 0.53),
      i("kb-sweetpotato", "Roasted Sweet Potato", "produce", 3, 14, 3, 0.43),
      i("kb-tofu", "Marinated Tofu", "dry", 5, 8, 3, 3.16),
      i("kb-chickpeas", "Spiced Chickpeas", "dry", 3, 9, 4, 1.79),
      i("kb-onion", "Pickled Red Onion", "produce", 4, 4, 7, 0.5),
      i("kb-feta", "Feta", "dairy", 14, 5, 5, 23.88),
    ],
    hidden: {
      coversSlope: 0.7,
      weather: { rain: 1.05, storm: 1.1, hot: 1.08, cold: 0.97, normal: 1.0 }, // office crowd orders in when it rains
      weekday: [1.0, 0.95, 1.0, 1.0, 1.05, 1.3, 1.1], // half the offices work from home on Fridays
      ingredientBias: { "kb-rice": 1.4, "kb-chicken": 0.9, "kb-greens": 1.2, "kb-sweetpotato": 1.05, "kb-tofu": 1.3, "kb-chickpeas": 0.85, "kb-onion": 0.8, "kb-feta": 0.95 },
    },
    todayLogs: [
      ["kb-rice", 2.5, "overprep", 14],
      ["kb-greens", 0.8, "spoiled", 14],
      ["kb-tofu", 0.6, "overprep", 15],
      ["kb-chicken", 0.4, "plate", 13],
    ],
  },
};

// Generic hidden world for kitchens without one (anyone's own restaurant in tests).
export const DEFAULT_HIDDEN: HiddenWorld = {
  coversSlope: 0.8,
  weather: { rain: 1.2, storm: 1.25, hot: 0.9, cold: 1.1, normal: 1.0 },
  weekday: [1, 1, 1, 1, 1, 1, 1],
  ingredientBias: {},
};

export function kitchenFor(profileId: string): DemoKitchen {
  return KITCHENS[profileId] ?? KITCHENS["marcos-trattoria"];
}

// The numbers a simulated kitchen needs from its profile.
export interface KitchenShape {
  id: string;
  coversByDay: number[];
  avgCovers: number;
  openDays: boolean[];
  hidden: HiddenWorld;
}

export function shapeOf(p: Pick<Profile, "id" | "coversByDay" | "avgCovers" | "openDays">): KitchenShape {
  return { id: p.id, coversByDay: p.coversByDay, avgCovers: p.avgCovers, openDays: p.openDays, hidden: KITCHENS[p.id]?.hidden ?? DEFAULT_HIDDEN };
}

// A few logs from earlier today so the log screen isn't empty.
export function seedTodayLogs(profileId: string): WasteLog[] {
  const now = new Date();
  return kitchenFor(profileId).todayLogs.map(([ingredientId, quantityKg, reason, hour], n) => {
    const t = new Date(now);
    t.setHours(hour, 10 + n * 7, 0, 0);
    return { id: `seed-${profileId}-${n}`, ingredientId, quantityKg, reason, loggedAt: t.toISOString() };
  });
}

export const isOpen = (p: Pick<Profile, "openDays" | "coversByDay">, dow: number) => p.openDays[dow] !== false && p.coversByDay[dow] > 0;
