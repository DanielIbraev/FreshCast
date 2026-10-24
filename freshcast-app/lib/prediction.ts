// FreshCast Prediction Engine
// Pure TypeScript math. No LLM touches the numbers.
// Two layers:
//   1. Priors: guests, weather, season, holiday, events, shelf life (works on day 1)
//   2. Learning: corrections fitted to this kitchen's own waste logs (lib/learning.ts)

import { PredictionInput, IngredientPrediction, DayWeather, NearbyEvent, SignalFactor } from "./types";
import { NO_LEARNING } from "./learning";

// Index 0 = Sunday ... 6 = Saturday. There is no fixed day-of-week prior:
// the kitchen's usual guests for each weekday already set that day's prep
// (usualPrepKg) and its demand baseline. A generic "Mondays waste more" prior
// on top would count the same effect twice, and is backwards for lunch spots.
// What's left (habits beyond guest count) is learned from logs.
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SEASONAL_FACTOR = [1.15, 1.15, 1.0, 1.0, 0.95, 0.95, 0.92, 0.92, 1.05, 1.05, 1.2, 1.2];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Perishability. Food that has to be thrown out tomorrow is far more likely to
// be wasted than food that keeps for a week. Set per ingredient by the owner.
export function shelfLifeFactor(days: number): number {
  if (days <= 1) return 1.2;
  if (days <= 2) return 1.1;
  if (days <= 4) return 1.0;
  if (days <= 7) return 0.9;
  return 0.8;
}

// Share of a normal day's prep that ends up in the bin with no forecasting.
export const BASE_WASTE_FRACTION = 0.08;
// Share of the forecast waste the prep plan removes. Kept below 1 so the
// kitchen still has a buffer and doesn't run out mid-service.
export const REDUCTION_RATE = 0.63;
// No forecast may say more than half of a day's prep goes in the bin.
export const MAX_WASTE_SHARE = 0.5;

// Usual prep for a weekday. baselinePrepKg is prep on an average open day;
// busier weekdays prep proportionally more (the kitchen's own par levels).
export function usualPrepKg(baselinePrepKg: number, usualCovers: number | undefined, avgCovers: number): number {
  if (usualCovers === undefined || avgCovers <= 0) return baselinePrepKg;
  return baselinePrepKg * (usualCovers / avgCovers);
}

function weatherFactor(w: DayWeather): number {
  if (w.condition === "rain" || w.condition === "storm") return 1.15;
  if (w.condition === "hot") return 0.9;
  if (w.condition === "cold") return 1.08;
  return 1.0;
}

function eventFactor(e: NearbyEvent): number {
  if (e.type === "game" || e.type === "concert") return 0.78;
  if (e.type === "festival" || e.type === "graduation") return 0.82;
  return 1.0;
}

function holiday(date: Date): { value: number; name: string } {
  const m = date.getMonth();
  const d = date.getDate();
  if (m === 10 && d >= 21 && d <= 27 && date.getDay() === 3) return { value: 0.7, name: "Thanksgiving Eve" };
  if (m === 11 && (d === 24 || d === 25)) return { value: 0.75, name: "Christmas" };
  if (m === 0 && d === 1) return { value: 1.35, name: "New Year's Day" };
  if (m === 6 && d === 4) return { value: 0.85, name: "July 4th" };
  return { value: 1.0, name: "" };
}

// Fewer guests than usual for this weekday means more of the prep is left over.
function demandFactor(expected: number, usual: number): number {
  if (usual <= 0) return 1.0;
  return Math.max(0.3, 1 + (1 - expected / usual) * 0.6);
}

const round = (n: number, p = 2) => Math.round(n * 10 ** p) / 10 ** p;

export function computeSignals(input: PredictionInput): SignalFactor[] {
  const { date, weather, event } = input;
  const L = input.learned ?? NO_LEARNING;
  const dow = date.getDay();
  const hol = holiday(date);
  const wx = input.weatherSource === "live" ? "Open-Meteo API" : input.weatherSource === "override" ? "Manual what-if" : "Seasonal fallback";
  const learnedDow = Math.abs(L.weekday - 1) > 0.005;
  const learnedWx = Math.abs(L.weather - 1) > 0.005;

  const usual = input.usualCovers ?? input.avgCovers;
  const guestSource = input.guestsSource === "what-if" ? "Manual what-if" : input.guestsSource === "served" ? "Guests served (close-out)" : input.coversSource === "pos-import" ? "Your sales export" : "Your usual guests";
  const signals: SignalFactor[] = [
    { key: "demand", label: "Guests", source: guestSource, detail: `${input.expectedCovers} vs ${usual} usual for ${DAY_NAMES[dow]}`, value: demandFactor(input.expectedCovers, usual) },
    {
      key: "weather",
      label: "Weather",
      source: learnedWx ? `${wx} + your logs` : wx,
      detail: learnedWx ? `${weather.description}, adjusted ×${L.weather.toFixed(2)}` : weather.description,
      value: weatherFactor(weather) * L.weather,
    },
    {
      key: "dayOfWeek",
      label: "Weekday habits",
      source: learnedDow ? "Learned from your logs" : "Not learned yet",
      detail: learnedDow ? `${DAY_NAMES[dow]}s, ×${L.weekday.toFixed(2)} beyond guest count` : `${DAY_NAMES[dow]} prep already scaled to usual guests`,
      value: L.weekday,
    },
    { key: "season", label: "Season", source: "Calendar", detail: MONTH_NAMES[date.getMonth()], value: SEASONAL_FACTOR[date.getMonth()] },
    { key: "holiday", label: "Holiday", source: "Holiday calendar", detail: hol.name || "None", value: hol.value },
    { key: "event", label: "Nearby events", source: event.type === "none" ? "None entered" : "Manual what-if", detail: event.type === "none" ? "None within 1 mi" : event.name, value: eventFactor(event) },
    {
      key: "shelfLife",
      label: "Shelf life",
      source: "Set when the item was added",
      detail: `${input.ingredient.shelfLifeDays} day${input.ingredient.shelfLifeDays === 1 ? "" : "s"} once prepped`,
      value: shelfLifeFactor(input.ingredient.shelfLifeDays),
    },
    {
      key: "recency",
      label: "Last week, same day",
      source: "Your waste logs",
      detail: L.lastWeekRatio !== null ? `${Math.round(L.lastWeekRatio * 100)}% of the prior` : "No data yet",
      value: L.recency,
    },
    {
      key: "calibration",
      label: "Kitchen calibration",
      source: "Learned from your logs",
      detail: L.days > 0 ? `${L.days} days of logs` : "Cold start",
      value: L.calibration,
    },
  ];
  return signals.map((s) => ({ ...s, value: round(s.value, 3) }));
}

export function predictIngredientWaste(input: PredictionInput): IngredientPrediction {
  const { ingredient } = input;
  const signals = computeSignals(input);
  const prep = usualPrepKg(ingredient.baselinePrepKg, input.usualCovers, input.avgCovers);
  const baseWasteKg = prep * BASE_WASTE_FRACTION;
  const multiplier = signals.reduce((acc, s) => acc * s.value, 1);
  const predictedWasteKg = Math.min(prep * MAX_WASTE_SHARE, Math.max(0, baseWasteKg * multiplier));
  const reducedWasteKg = predictedWasteKg * (1 - REDUCTION_RATE);
  const cutKg = predictedWasteKg - reducedWasteKg;

  const primaryDriver = [...signals].sort((a, b) => Math.abs(b.value - 1) - Math.abs(a.value - 1))[0];
  const predictedWasteCost = predictedWasteKg * ingredient.costPerKg;
  const verb = primaryDriver.value >= 1 ? "pushes waste up" : "keeps waste down";

  return {
    ingredient,
    baseWasteKg: round(baseWasteKg, 3),
    signals,
    predictedWasteKg: round(predictedWasteKg),
    predictedWasteCost: round(predictedWasteCost),
    predictedCo2Kg: round(predictedWasteKg * ingredient.co2PerKg),
    reducedWasteKg: round(reducedWasteKg),
    reducedWasteCost: round(reducedWasteKg * ingredient.costPerKg),
    reducedCo2Kg: round(reducedWasteKg * ingredient.co2PerKg),
    cutKg: round(cutKg, 3),
    // Clamp after rounding: for tiny items, rounding could otherwise recommend
    // MORE than usual prep (found by property test P4).
    usualPrepKg: round(prep, 3),
    recommendedPrepKg: Math.min(prep, round(Math.max(0, prep - cutKg))),
    recommendation: `Prep ${round(cutKg, 1)}kg less. ${primaryDriver.label} (${primaryDriver.detail}) ${verb}.`,
    riskLevel: predictedWasteCost >= 10 ? "high" : predictedWasteCost >= 4 ? "medium" : "low",
    primaryDriver,
  };
}

// Prior-only forecast of "prep as usual" waste. Learning compares logs to this.
export function priorWasteKg(input: Omit<PredictionInput, "learned">): number {
  const signals = computeSignals({ ...input, learned: NO_LEARNING });
  const prep = usualPrepKg(input.ingredient.baselinePrepKg, input.usualCovers, input.avgCovers);
  return Math.min(prep * MAX_WASTE_SHARE, prep * BASE_WASTE_FRACTION * signals.reduce((a, s) => a * s.value, 1));
}
