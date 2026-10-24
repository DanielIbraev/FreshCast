// Starter ingredients per cuisine, with typical US wholesale prices ($/kg).
// The owner picks the ones they use at setup and can edit any of them later.

import { Category, CuisineType, Ingredient } from "./types";
import { CATEGORIES } from "./categories";

type Staple = Omit<Ingredient, "id" | "co2PerKg">;
const s = (name: string, category: Category, costPerKg: number, baselinePrepKg: number, shelfLifeDays: number): Staple => ({ name, category, costPerKg, baselinePrepKg, shelfLifeDays });

const ITALIAN: Staple[] = [
  s("Fresh Mozzarella", "dairy", 16, 5, 5),
  s("San Marzano Tomatoes", "produce", 6.5, 8, 6),
  s("Fresh Basil", "produce", 22, 1.5, 2),
  s("Fresh Pasta Dough", "bakery", 4, 10, 2),
  s("Prosciutto di Parma", "meat", 42, 3, 7),
  s("Arugula", "produce", 12.5, 4, 3),
  s("Parmigiano Reggiano", "dairy", 24, 2, 14),
  s("Burrata", "dairy", 26, 2.5, 2),
  s("Focaccia", "bakery", 3.5, 12, 1),
];

export const STAPLES: Record<CuisineType, Staple[]> = {
  italian: ITALIAN,
  french: [
    s("Butter", "dairy", 11, 3, 14),
    s("Heavy Cream", "dairy", 6, 4, 5),
    s("Baguette", "bakery", 4, 10, 1),
    s("Duck Breast", "meat", 30, 4, 3),
    s("Shallots", "produce", 7, 2, 10),
    s("Haricots Verts", "produce", 9, 3, 4),
    s("Gruyère", "dairy", 28, 2, 14),
    s("Mussels", "seafood", 9, 5, 2),
  ],
  sushi: [
    s("Sushi Rice (cooked)", "dry", 3, 12, 1),
    s("Bluefin Tuna", "seafood", 60, 3, 2),
    s("Atlantic Salmon", "seafood", 28, 5, 2),
    s("Yellowtail", "seafood", 38, 3, 2),
    s("Avocado", "produce", 7, 4, 3),
    s("Cucumber", "produce", 3, 3, 5),
    s("Nori", "dry", 40, 0.5, 30),
    s("Tobiko", "seafood", 55, 0.5, 5),
  ],
  seafood: [
    s("Atlantic Salmon", "seafood", 28, 6, 2),
    s("Cod", "seafood", 20, 6, 2),
    s("Sea Scallops", "seafood", 45, 3, 2),
    s("Shrimp", "seafood", 22, 5, 2),
    s("Lemons", "produce", 4.5, 3, 7),
    s("Clam Chowder Base", "dairy", 8, 8, 3),
    s("Oyster Crackers", "dry", 6, 1, 30),
    s("Coleslaw", "produce", 5, 4, 3),
  ],
  burger: [
    s("Ground Beef Patties", "meat", 13, 12, 2),
    s("Brioche Buns", "bakery", 5, 8, 3),
    s("Cheddar Slices", "dairy", 11, 3, 14),
    s("Lettuce", "produce", 5, 3, 4),
    s("Tomatoes", "produce", 5, 4, 5),
    s("Onions", "produce", 2, 3, 14),
    s("Fries (cut)", "produce", 2.5, 20, 2),
    s("Bacon", "meat", 14, 3, 5),
  ],
  fast_casual: [
    s("Grilled Chicken", "meat", 11, 10, 3),
    s("Rice (cooked)", "dry", 2.5, 15, 1),
    s("Black Beans", "dry", 3, 8, 3),
    s("Mixed Greens", "produce", 9, 5, 3),
    s("Pico de Gallo", "produce", 6, 4, 2),
    s("Guacamole", "produce", 12, 3, 1),
    s("Tortillas", "bakery", 4, 6, 7),
    s("Sour Cream", "dairy", 5, 2, 10),
  ],
  fine_dining: [
    s("Wagyu Beef", "meat", 120, 2, 4),
    s("Halibut", "seafood", 45, 3, 2),
    s("Microgreens", "produce", 60, 0.5, 3),
    s("Truffle Butter", "dairy", 70, 0.5, 14),
    s("Heirloom Carrots", "produce", 8, 3, 7),
    s("Brioche", "bakery", 9, 3, 2),
    s("Crème Fraîche", "dairy", 14, 1.5, 10),
    s("Chanterelles", "produce", 55, 1, 3),
  ],
};

export function toIngredient(st: Staple): Ingredient {
  return { ...st, id: `${st.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`, co2PerKg: CATEGORIES[st.category].co2PerKg };
}

export const CUISINE_LABELS: Record<CuisineType, string> = {
  italian: "Italian",
  french: "French bistro",
  sushi: "Sushi / Japanese",
  seafood: "Seafood",
  burger: "Burgers & American",
  fast_casual: "Fast casual",
  fine_dining: "Fine dining",
};
