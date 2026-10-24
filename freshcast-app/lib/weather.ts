import { DayWeather, WeatherCondition } from "./types";
import { localISO } from "./demo-data";

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

export const CONDITION_LABEL: Record<WeatherCondition, string> = {
  rain: "Rain",
  storm: "Storms",
  hot: "Hot",
  cold: "Cold",
  normal: "Clear",
};

// Maps a WMO weather code + temp + rain chance to one of the model's conditions.
export function classify(code: number, tempF: number, precipProb: number): WeatherCondition {
  if (code >= 95) return "storm";
  if (RAIN_CODES.has(code) || precipProb >= 60) return "rain";
  if (tempF >= 85) return "hot";
  if (SNOW_CODES.has(code) || tempF <= 32) return "cold";
  return "normal";
}

export function describe(condition: WeatherCondition, tempF: number): string {
  return `${CONDITION_LABEL[condition]}, ${Math.round(tempF)}°F`;
}

// Used if the API is unreachable (e.g. venue Wi-Fi drops mid-demo).
export function fallbackWeek(): DayWeather[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const condition: WeatherCondition = i === 2 ? "rain" : "normal";
    const tempF = 56 - (i % 3) * 2;
    return { date: localISO(d), tempF, condition, precipProb: condition === "rain" ? 70 : 10, description: describe(condition, tempF) };
  });
}
