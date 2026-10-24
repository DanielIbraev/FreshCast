// Runs the prediction engine across every ingredient for one day, with
// learned corrections fitted from the kitchen's stored close-outs.

import { predictIngredientWaste, priorWasteKg } from "./prediction";
import { CuisineType, DayPrediction, DayWeather, Ingredient, NearbyEvent } from "./types";
import { learn, Observation } from "./learning";

interface ForecastOptions {
  ingredients: Ingredient[];
  observations: Observation[];
  expectedCovers: number;
  weather: DayWeather;
  weatherSource: "live" | "override" | "offline";
  event: NearbyEvent;
  date: Date;
  cuisineType: CuisineType;
  avgCovers: number;
  usualCovers: number; // usual guests for this weekday; 0 = closed
  open: boolean;
  guestsSource?: "usual" | "what-if";
  coversSource?: "default" | "pos-import";
}

const round = (n: number) => Math.round(n * 100) / 100;

export function buildDayForecast(opts: ForecastOptions): DayPrediction {
  if (!opts.open || opts.usualCovers <= 0) {
    // Closed: nothing is prepped, so nothing is forecast or saved.
    return {
      date: opts.weather.date,
      closed: true,
      usualCovers: 0,
      expectedCovers: 0,
      weather: opts.weather,
      event: opts.event,
      ingredients: [],
      totalWasteCost: 0,
      totalReducedCost: 0,
      totalSavings: 0,
      totalCo2Prevented: 0,
    };
  }
  const ingredients = opts.ingredients
    .map((ingredient) => {
      const input = {
        ingredient,
        expectedCovers: opts.expectedCovers,
        avgCovers: opts.avgCovers,
        weather: opts.weather,
        weatherSource: opts.weatherSource,
        date: opts.date,
        event: opts.event,
        cuisineType: opts.cuisineType,
        usualCovers: opts.usualCovers,
        guestsSource: opts.guestsSource,
        coversSource: opts.coversSource,
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
    usualCovers: opts.usualCovers,
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
