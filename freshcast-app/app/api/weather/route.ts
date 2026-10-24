import { NextRequest, NextResponse } from "next/server";
import { classify, describe, fallbackWeek } from "@/lib/weather";
import { DEMO_RESTAURANT } from "@/lib/demo-data";
import { DayWeather } from "@/lib/types";

// Cache the forecast for 30 minutes; weather doesn't change faster than that.
export const dynamic = "force-dynamic";

// Restaurant location comes from the query string; anything invalid falls back to the demo.
function coord(v: string | null, limit: number, fallback: number): number {
  const n = Number(v);
  return v !== null && Number.isFinite(n) && Math.abs(n) <= limit ? Math.round(n * 1e4) / 1e4 : fallback;
}

export async function GET(req: NextRequest) {
  const lat = coord(req.nextUrl.searchParams.get("lat"), 90, DEMO_RESTAURANT.lat);
  const lng = coord(req.nextUrl.searchParams.get("lng"), 180, DEMO_RESTAURANT.lng);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,temperature_2m_max,precipitation_probability_max` +
    `&temperature_unit=fahrenheit&timezone=auto&forecast_days=8`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();
    const d = data.daily;

    // Index 0 is today (used for tonight's close-out); 1-7 are the forecast week.
    const days: DayWeather[] = d.time.slice(0, 8).map((date: string, i: number) => {
      const code = d.weather_code[i];
      const tempF = d.temperature_2m_max[i];
      const precipProb = d.precipitation_probability_max[i] ?? 0;
      const condition = classify(code, tempF, precipProb);
      return { date, tempF, condition, precipProb, description: describe(condition, tempF) };
    });

    return NextResponse.json({ source: "live", days });
  } catch {
    return NextResponse.json({ source: "offline", days: fallbackWeek() });
  }
}
