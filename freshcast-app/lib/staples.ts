// Starter ingredients per cuisine, with typical US wholesale prices ($/kg),
// daily prep for a ~60-cover restaurant, and shelf life once prepped (days).
// The owner picks the ones they use at setup and can edit any of them later.

import { Category, CuisineType, Ingredient } from "./types";
import { CATEGORIES } from "./categories";

export type Staple = Omit<Ingredient, "id" | "co2PerKg">;
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
  pizza: [
    s("Pizza Dough", "bakery", 3, 15, 2),
    s("Shredded Mozzarella", "dairy", 12, 7, 5),
    s("Pizza Sauce", "produce", 4, 6, 4),
    s("Pepperoni", "meat", 15, 2.5, 10),
    s("Italian Sausage", "meat", 11, 2, 4),
    s("Mushrooms", "produce", 8, 2, 4),
    s("Green Peppers", "produce", 5, 1.5, 5),
    s("Red Onions", "produce", 2.5, 1.5, 7),
    s("Ricotta", "dairy", 8, 1.5, 7),
    s("Fresh Basil", "produce", 22, 0.4, 2),
  ],
  american: [
    s("Chicken Breast", "meat", 9, 6, 3),
    s("Ribeye Steak", "meat", 30, 3, 4),
    s("Bacon", "meat", 14, 2.5, 5),
    s("Eggs", "dairy", 5, 5, 21),
    s("Home Fries (cut)", "produce", 2.5, 8, 2),
    s("Romaine Lettuce", "produce", 5, 3, 4),
    s("Tomatoes", "produce", 5, 3, 5),
    s("Cheddar", "dairy", 11, 2, 14),
    s("Sandwich Bread", "bakery", 4, 4, 4),
    s("Pancake Batter", "bakery", 2.5, 5, 2),
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
    s("Pickles", "produce", 4, 1, 30),
  ],
  bbq: [
    s("Beef Brisket", "meat", 15, 14, 4),
    s("Pork Shoulder", "meat", 7, 12, 4),
    s("Pork Ribs", "meat", 10, 10, 4),
    s("Chicken Thighs", "meat", 7, 6, 3),
    s("Coleslaw", "produce", 5, 5, 3),
    s("Mac and Cheese", "dairy", 7, 6, 3),
    s("Baked Beans", "dry", 3.5, 5, 4),
    s("Cornbread", "bakery", 3.5, 4, 2),
    s("BBQ Sauce", "dry", 5, 2, 30),
  ],
  mexican: [
    s("Corn Tortillas", "bakery", 3.5, 6, 5),
    s("Carne Asada", "meat", 15, 6, 3),
    s("Carnitas", "meat", 8, 5, 4),
    s("Chicken Tinga", "meat", 9, 5, 3),
    s("Black Beans", "dry", 3, 6, 3),
    s("Mexican Rice", "dry", 2.5, 8, 2),
    s("Guacamole", "produce", 12, 3, 1),
    s("Pico de Gallo", "produce", 6, 4, 2),
    s("Cilantro", "produce", 12, 0.8, 4),
    s("Queso Fresco", "dairy", 14, 1.5, 10),
  ],
  chinese: [
    s("Jasmine Rice (cooked)", "dry", 2.5, 15, 1),
    s("Chicken Thighs", "meat", 8, 8, 3),
    s("Pork Shoulder", "meat", 7, 5, 3),
    s("Shrimp", "seafood", 22, 3, 2),
    s("Fresh Egg Noodles", "bakery", 4, 6, 3),
    s("Dumpling Wrappers", "bakery", 5, 2, 4),
    s("Bok Choy", "produce", 5, 4, 3),
    s("Broccoli", "produce", 5, 4, 4),
    s("Tofu", "produce", 5, 3, 4),
    s("Scallions", "produce", 6, 1, 5),
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
  thai: [
    s("Jasmine Rice (cooked)", "dry", 2.5, 12, 1),
    s("Rice Noodles", "bakery", 4, 6, 2),
    s("Chicken Thighs", "meat", 8, 7, 3),
    s("Shrimp", "seafood", 22, 3, 2),
    s("Tofu", "produce", 5, 3, 4),
    s("Coconut Milk", "dry", 4, 5, 4),
    s("Green Curry Paste", "dry", 12, 0.8, 14),
    s("Thai Basil", "produce", 20, 0.6, 2),
    s("Bean Sprouts", "produce", 4, 2, 2),
    s("Limes", "produce", 4, 1.5, 10),
  ],
  indian: [
    s("Basmati Rice (cooked)", "dry", 3, 12, 1),
    s("Chicken Thighs", "meat", 8, 9, 3),
    s("Lamb Shoulder", "meat", 18, 4, 3),
    s("Paneer", "dairy", 14, 3, 5),
    s("Plain Yogurt", "dairy", 4, 4, 10),
    s("Heavy Cream", "dairy", 6, 2, 5),
    s("Naan Dough", "bakery", 3, 6, 2),
    s("Chickpeas (cooked)", "dry", 3, 5, 4),
    s("Spinach", "produce", 7, 4, 3),
    s("Onion-Tomato Masala", "produce", 4, 6, 4),
  ],
  mediterranean: [
    s("Chicken Shawarma", "meat", 9, 8, 3),
    s("Lamb (gyro)", "meat", 18, 4, 3),
    s("Hummus", "dry", 6, 5, 4),
    s("Falafel Mix", "dry", 4, 4, 2),
    s("Pita", "bakery", 4, 6, 3),
    s("Tzatziki", "dairy", 7, 3, 4),
    s("Feta", "dairy", 12, 2, 10),
    s("Tomatoes", "produce", 5, 4, 5),
    s("Cucumbers", "produce", 3, 4, 5),
    s("Parsley", "produce", 10, 1, 4),
  ],
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
  cafe_bakery: [
    s("Croissant Dough", "bakery", 6, 5, 2),
    s("Sourdough Loaves", "bakery", 5, 8, 2),
    s("Muffin Batter", "bakery", 4, 4, 2),
    s("Whole Milk", "dairy", 1.2, 12, 7),
    s("Butter", "dairy", 11, 3, 14),
    s("Eggs", "dairy", 5, 4, 21),
    s("Cream Cheese", "dairy", 9, 1, 14),
    s("Avocado", "produce", 7, 2, 2),
    s("Berries", "produce", 12, 1.5, 3),
    s("Smoked Salmon", "seafood", 40, 0.6, 5),
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
  vegetarian: [
    s("Tofu", "produce", 5, 5, 4),
    s("Chickpeas (cooked)", "dry", 3, 5, 4),
    s("Lentils (cooked)", "dry", 3, 5, 4),
    s("Quinoa (cooked)", "dry", 5, 6, 3),
    s("Kale", "produce", 8, 3, 4),
    s("Mixed Greens", "produce", 9, 4, 3),
    s("Roasted Sweet Potatoes", "produce", 3, 5, 3),
    s("Mushrooms", "produce", 8, 3, 4),
    s("Avocado", "produce", 7, 3, 2),
    s("Tahini Dressing", "dry", 9, 1.5, 7),
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

// Read in sentences like "Common for {label} kitchens", so keep them nouns.
export const CUISINE_LABELS: Record<CuisineType, string> = {
  italian: "Italian",
  pizza: "Pizza",
  american: "American",
  burger: "Burgers",
  bbq: "Barbecue",
  mexican: "Mexican",
  chinese: "Chinese",
  sushi: "Sushi / Japanese",
  thai: "Thai & Southeast Asian",
  indian: "Indian",
  mediterranean: "Mediterranean & Middle Eastern",
  french: "French bistro",
  seafood: "Seafood",
  cafe_bakery: "Café & bakery",
  fast_casual: "Fast casual",
  vegetarian: "Vegetarian & vegan",
  fine_dining: "Fine dining",
};

// OpenStreetMap `cuisine=*` values → the closest FreshCast cuisine.
const OSM_CUISINE: Record<string, CuisineType> = {
  italian: "italian", pasta: "italian", italian_pizza: "pizza",
  pizza: "pizza",
  american: "american", diner: "american", breakfast: "american", brunch: "american", steak_house: "american", steak: "american",
  wings: "american", chicken: "american", fried_chicken: "american", regional: "american", southern: "american", soul_food: "american", caribbean: "american",
  burger: "burger", hot_dog: "burger", hamburger: "burger",
  bbq: "bbq", barbecue: "bbq", smokehouse: "bbq", brazilian: "bbq",
  mexican: "mexican", "tex-mex": "mexican", tex_mex: "mexican", burrito: "mexican", tacos: "mexican", taco: "mexican", latin_american: "mexican", salvadoran: "mexican",
  chinese: "chinese", cantonese: "chinese", sichuan: "chinese", szechuan: "chinese", dim_sum: "chinese", dumpling: "chinese", dumplings: "chinese",
  taiwanese: "chinese", hong_kong: "chinese", noodle: "chinese", asian: "chinese", korean: "chinese",
  sushi: "sushi", japanese: "sushi", ramen: "sushi", poke: "sushi", izakaya: "sushi",
  thai: "thai", vietnamese: "thai", pho: "thai", malaysian: "thai", indonesian: "thai", filipino: "thai", laotian: "thai", cambodian: "thai",
  indian: "indian", pakistani: "indian", nepalese: "indian", bangladeshi: "indian", sri_lankan: "indian", curry: "indian", himalayan: "indian",
  mediterranean: "mediterranean", greek: "mediterranean", lebanese: "mediterranean", middle_eastern: "mediterranean", turkish: "mediterranean",
  kebab: "mediterranean", falafel: "mediterranean", shawarma: "mediterranean", persian: "mediterranean", israeli: "mediterranean",
  moroccan: "mediterranean", arab: "mediterranean", spanish: "mediterranean", tapas: "mediterranean", portuguese: "mediterranean",
  french: "french", bistro: "french", crepe: "french", crepes: "french",
  seafood: "seafood", fish: "seafood", fish_and_chips: "seafood", oyster: "seafood", oysters: "seafood", lobster: "seafood",
  coffee_shop: "cafe_bakery", coffee: "cafe_bakery", cafe: "cafe_bakery", bakery: "cafe_bakery", bagel: "cafe_bakery", donut: "cafe_bakery",
  pastry: "cafe_bakery", cake: "cafe_bakery", dessert: "cafe_bakery", tea: "cafe_bakery", bubble_tea: "cafe_bakery", juice: "cafe_bakery", ice_cream: "cafe_bakery",
  sandwich: "fast_casual", salad: "fast_casual", deli: "fast_casual", bowl: "fast_casual", wrap: "fast_casual",
  vegetarian: "vegetarian", vegan: "vegetarian", health_food: "vegetarian", raw_food: "vegetarian",
  fine_dining: "fine_dining",
};

const OSM_AMENITY: Record<string, CuisineType> = {
  cafe: "cafe_bakery",
  bakery: "cafe_bakery",
  ice_cream: "cafe_bakery",
  fast_food: "fast_casual",
};

// "pizza;italian" → pizza (first value that maps wins). Falls back to the
// amenity type (cafe, fast_food...), then to a general American kitchen.
export function osmCuisineToType(tag: string | undefined, amenity?: string): CuisineType {
  const values = (tag ?? "")
    .toLowerCase()
    .split(/[;,]/)
    .map((v) => v.trim().replace(/\s+/g, "_"))
    .filter(Boolean);
  for (const v of values) {
    const hit = OSM_CUISINE[v] ?? OSM_CUISINE[v.replace(/_restaurant$/, "")];
    if (hit) return hit;
  }
  if (amenity && OSM_AMENITY[amenity]) return amenity === "fast_food" && !values.length ? "burger" : OSM_AMENITY[amenity];
  return "american";
}
