// FreshCast core data types

export type CuisineType = "italian" | "french" | "sushi" | "seafood" | "burger" | "fast_casual" | "fine_dining";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  cuisineType: CuisineType;
}

export interface Ingredient {
  id: string;
  name: string;
  costPerKg: number;
  // baseline amount the kitchen preps on an average day (kg)
  baselinePrepKg: number;
  // CO2 kg emitted per kg of this ingredient wasted (FAO/WRAP factors)
  co2PerKg: number;
}

export interface WasteLog {
  id: string;
  ingredientId: string;
  quantityKg: number;
  loggedAt: string; // ISO date
}

export interface WeatherForecast {
  tempF: number;
  condition: "rain" | "storm" | "hot" | "cold" | "normal";
  description: string;
}

export interface NearbyEvent {
  name: string;
  type: "concert" | "game" | "festival" | "graduation" | "none";
  distanceMiles: number;
}

export interface PredictionInput {
  ingredient: Ingredient;
  expectedCovers: number;
  avgCovers: number;
  weather: WeatherForecast;
  date: Date;
  event: NearbyEvent;
  cuisineType: CuisineType;
  lastWeekSameDayActualKg?: number;
  lastWeekSameDayPredictedKg?: number;
  personalCalibration?: number; // learned ratio, defaults to 1.0
}

export interface IngredientPrediction {
  ingredient: Ingredient;
  predictedWasteKg: number;
  predictedWasteCost: number;
  predictedCo2Kg: number;
  // waste after applying FreshCast's prep recommendation
  reducedWasteKg: number;
  reducedWasteCost: number;
  reducedCo2Kg: number;
  recommendation: string;
  riskLevel: "high" | "medium" | "low";
  // the dominant signal that drove this prediction, for the explanation
  primaryDriver: string;
}

export interface DayPrediction {
  date: string;
  expectedCovers: number;
  weather: WeatherForecast;
  event: NearbyEvent;
  ingredients: IngredientPrediction[];
  totalWasteCost: number;
  totalReducedCost: number;
  totalSavings: number;
  totalCo2Prevented: number;
}
