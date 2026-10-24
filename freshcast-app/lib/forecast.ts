// Assembles a full-day waste forecast across all ingredients by running
// the prediction engine for each one and aggregating the results.

import { predictIngredientWaste } from "./prediction";
import { DayPrediction, WeatherForecast, NearbyEvent, WasteLog } from "./types";
import {
  DEMO_INGREDIENTS,
  DEMO_RESTAURANT,
  AVG_COVERS,
  generateLastWeekLogs,
} from "./demo-data";

interface ForecastOptions {
  expectedCovers: number;
  weather: WeatherForecast;
  event: NearbyEvent;
  date: Date;
}

export function buildDayForecast(opts: ForecastOptions): DayPrediction {
  const lastWeekLogs = generateLastWeekLogs();
  const lastWeekMap = new Map<string, number>();
  lastWeekLogs.forEach((log: WasteLog) =>
    lastWeekMap.set(log.ingredientId, log.quantityKg)
  );

  const ingredients = DEMO_INGREDIENTS.map((ingredient) => {
    const lastWeekActual = lastWeekMap.get(ingredient.id);
    // Rough estimate of what we predicted last week for the recency ratio.
    const lastWeekPredicted = lastWeekActual
      ? lastWeekActual * 1.1
      : undefined;

    return predictIngredientWaste({
      ingredient,
      expectedCovers: opts.expectedCovers,
      avgCovers: AVG_COVERS,
      weather: opts.weather,
      date: opts.date,
      event: opts.event,
      cuisineType: DEMO_RESTAURANT.cuisineType,
      lastWeekSameDayActualKg: lastWeekActual,
      lastWeekSameDayPredictedKg: lastWeekPredicted,
      personalCalibration: 1.0,
    });
  }).sort((a, b) => b.predictedWasteCost - a.predictedWasteCost);

  const totalWasteCost = ingredients.reduce(
    (s, i) => s + i.predictedWasteCost,
    0
  );
  const totalReducedCost = ingredients.reduce(
    (s, i) => s + i.reducedWasteCost,
    0
  );
  const totalCo2Prevented = ingredients.reduce(
    (s, i) => s + (i.predictedCo2Kg - i.reducedCo2Kg),
    0
  );

  return {
    date: opts.date.toISOString().split("T")[0],
    expectedCovers: opts.expectedCovers,
    weather: opts.weather,
    event: opts.event,
    ingredients,
    totalWasteCost: round(totalWasteCost),
    totalReducedCost: round(totalReducedCost),
    totalSavings: round(totalWasteCost - totalReducedCost),
    totalCo2Prevented: round(totalCo2Prevented),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
