// Runs the prediction engine across every ingredient for one day, with
// learned corrections fitted from the kitchen's stored close-outs.

import { predictIngredientWaste, priorWasteKg } from "./prediction";
import { DayPrediction, DayWeather, Ingredient, NearbyEvent } from "./types";
import { DEMO_RESTAURANT, AVG_COVERS } from "./demo-data";
import { learn, Observation } from "./learning";

interface ForecastOptions {
  ingredients: Ingredient[];
  observations: Observation[];
  expectedCovers: number;
  weather: DayWeather;
  weatherSource: "live" | "override" | "offline";
  event: NearbyEvent;
  date: Date;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function buildDayForecast(opts: ForecastOptions): DayPrediction {
  const ingredients = opts.ingredients
    .map((ingredient) => {
      const input = {
        ingredient,
        expectedCovers: opts.expectedCovers,
        avgCovers: AVG_COVERS,
        weather: opts.weather,
        weatherSource: opts.weatherSource,
        date: opts.date,
        event: opts.event,
        cuisineType: DEMO_RESTAURANT.cuisineType,
      };
      const learned = learn(opts.observations, ingredient.id, opts.weather.date, opts.weather.condition);
      return { ...predictIngredientWaste({ ...input, learned }), priorKg: Math.round(priorWasteKg(input) * 1000) / 1000 };
    })
    .sort((a, b) => b.predictedWasteCost - a.predictedWasteCost);

  const totalWasteCost = ingredients.reduce((s, i) => s + i.predictedWasteCost, 0);
  const totalReducedCost = ingredients.reduce((s, i) => s + i.reducedWasteCost, 0);
  const totalCo2Prevented = ingredients.reduce((s, i) => s + (i.predictedCo2Kg - i.reducedCo2Kg), 0);

  return {
    date: opts.weather.date,
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
