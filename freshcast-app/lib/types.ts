// FreshCast core data types

export type CuisineType =
  | "italian"
  | "french"
  | "sushi"
  | "seafood"
  | "burger"
  | "fast_casual"
  | "fine_dining";

export type Category = "produce" | "meat" | "seafood" | "dairy" | "bakery" | "dry";

export type WeatherCondition = "rain" | "storm" | "hot" | "cold" | "normal";

export type EventType = "none" | "game" | "concert" | "festival" | "graduation";

export type WasteReason = "overprep" | "spoiled" | "plate" | "dropped";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  cuisineType: CuisineType;
}

// What the model has learned about one ingredient from the restaurant's logs.
export interface IngredientHistory {
  lastWeekRatio: number; // last week same day: actual waste / predicted waste
  calibration: number; // rolling 4-week actual/predicted ratio
  weeksOfData: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  costPerKg: number;
  baselinePrepKg: number; // what the kitchen preps on a normal day
  shelfLifeDays: number;
  co2PerKg: number; // kg CO2e per kg wasted (FAO/WRAP factors)
  history?: IngredientHistory; // undefined = cold start, model still learning
}

export interface WasteLog {
  id: string;
  ingredientId: string;
  quantityKg: number;
  reason: WasteReason;
  loggedAt: string; // ISO timestamp
}

export interface DayWeather {
  date: string; // YYYY-MM-DD, local
  tempF: number;
  condition: WeatherCondition;
  precipProb: number;
  description: string;
}

export interface NearbyEvent {
  type: EventType;
  name: string;
  distanceMiles: number;
}

// What-if overrides the owner applies to the selected day.
export interface Scenario {
  selectedDate: string | null;
  coversOverride: number | null;
  weatherOverride: WeatherCondition | "live";
  event: EventType;
}

export type SignalKey =
  | "demand"
  | "weather"
  | "dayOfWeek"
  | "season"
  | "holiday"
  | "event"
  | "cuisine"
  | "recency"
  | "calibration";

export interface SignalFactor {
  key: SignalKey;
  label: string;
  source: string;
  detail: string;
  value: number;
}

export interface PredictionInput {
  ingredient: Ingredient;
  expectedCovers: number;
  avgCovers: number;
  weather: DayWeather;
  weatherSource: "live" | "override" | "offline";
  date: Date;
  event: NearbyEvent;
  cuisineType: CuisineType;
  learned?: Learned;
}

export interface IngredientPrediction {
  ingredient: Ingredient;
  baseWasteKg: number;
  signals: SignalFactor[];
  predictedWasteKg: number;
  predictedWasteCost: number;
  predictedCo2Kg: number;
  reducedWasteKg: number;
  reducedWasteCost: number;
  reducedCo2Kg: number;
  cutKg: number;
  recommendedPrepKg: number;
  recommendation: string;
  riskLevel: "high" | "medium" | "low";
  primaryDriver: SignalFactor;
}

export interface DayPrediction {
  date: string;
  expectedCovers: number;
  weather: DayWeather;
  event: NearbyEvent;
  ingredients: IngredientPrediction[];
  totalWasteCost: number;
  totalReducedCost: number;
  totalSavings: number;
  totalCo2Prevented: number;
}
