import { Category, WasteReason } from "./types";

// Default CO2 factors per category (kg CO2e per kg wasted, FAO/WRAP averages).
// The owner never has to know these: picking a category fills them in.
export const CATEGORIES: Record<
  Category,
  { label: string; co2PerKg: number; color: string }
> = {
  produce: { label: "Produce", co2PerKg: 2.0, color: "#34D399" },
  meat: { label: "Meat", co2PerKg: 20.0, color: "#F87171" },
  seafood: { label: "Seafood", co2PerKg: 11.9, color: "#60A5FA" },
  dairy: { label: "Dairy", co2PerKg: 8.6, color: "#FBBF24" },
  bakery: { label: "Bakery & pasta", co2PerKg: 1.4, color: "#FB923C" },
  dry: { label: "Dry goods", co2PerKg: 1.6, color: "#94A3B8" },
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
