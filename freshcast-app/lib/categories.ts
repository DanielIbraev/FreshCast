import { Category, WasteReason } from "./types";

// Default CO2e factors per category (kg CO2e per kg of food, farm to retail),
// from Poore & Nemecek (2018) via Our World in Data. Conservative picks within
// each category: produce = other vegetables, meat = pig meat (beef is ~8x
// higher; set it per item), seafood = farmed fish, dairy = milk (cheese is
// 23.88; set it per item), bakery = wheat & rye, dry = rice/pulses average.
// The owner never has to know these: picking a category fills them in.
export const CATEGORIES: Record<
  Category,
  { label: string; co2PerKg: number; color: string }
> = {
  produce: { label: "Produce", co2PerKg: 0.53, color: "#34D399" },
  meat: { label: "Meat", co2PerKg: 12.31, color: "#F87171" },
  seafood: { label: "Seafood", co2PerKg: 13.63, color: "#60A5FA" },
  dairy: { label: "Dairy", co2PerKg: 3.15, color: "#FBBF24" },
  bakery: { label: "Bakery & pasta", co2PerKg: 1.57, color: "#FB923C" },
  dry: { label: "Dry goods", co2PerKg: 3.1, color: "#94A3B8" },
};

export const CATEGORY_ORDER: Category[] = [
  "produce",
  "meat",
  "seafood",
  "dairy",
  "bakery",
  "dry",
];

export const WASTE_REASONS: Record<WasteReason, { label: string; color: string }> = {
  overprep: { label: "Over-prepped", color: "#EF4444" },
  spoiled: { label: "Spoiled", color: "#F59E0B" },
  plate: { label: "Plate waste", color: "#60A5FA" },
  dropped: { label: "Dropped", color: "#94A3B8" },
};
