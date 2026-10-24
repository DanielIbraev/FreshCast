import { NextResponse } from "next/server";
import { classify, describe, fallbackWeek } from "@/lib/weather";
import { DEMO_RESTAURANT } from "@/lib/demo-data";
import { DayWeather } from "@/lib/types";

// Cache the forecast for 30 minutes; weather doesn't change faster than that.
export const revalidate = 1800;

export async function GET() {
  const { lat, lng } = DEMO_RESTAURANT;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,temperature_2m_max,precipitation_probability_max` +
    `&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=8`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();
    const d = data.daily;

    // Skip index 0 (today); forecast the next 7 days.
    const days: DayWeather[] = d.time.slice(1, 8).map((date: string, i: number) => {
      const code = d.weather_code[i + 1];
      const tempF = d.temperature_2m_max[i + 1];
      const precipProb = d.precipitation_probability_max[i + 1] ?? 0;
      const condition = classify(code, tempF, precipProb);
      return { date, tempF, condition, precipProb, description: describe(condition, tempF) };
    });

    return NextResponse.json({ source: "live", days });
  } catch {
    return NextResponse.json({ source: "offline", days: fallbackWeek() });
  }
}
