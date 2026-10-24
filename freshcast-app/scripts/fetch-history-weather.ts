// Saves the real daily weather for Boston (Open-Meteo, CC BY 4.0) over the
// last 92 days into lib/history-weather.json. The simulated demo histories and
// the benchmark replay each night on the weather that actually happened.
// Run before a demo day: npx tsx --tsconfig tsconfig.json scripts/fetch-history-weather.ts
import { readFileSync, writeFileSync, existsSync } from "fs";
import { classify } from "../lib/weather";

const OUT = "lib/history-weather.json";
type Day = { tempF: number; condition: string; precipMm: number; code: number };

async function main() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=42.36&longitude=-71.06" +
    "&daily=weather_code,temperature_2m_max,precipitation_sum&temperature_unit=fahrenheit" +
    "&timezone=America%2FNew_York&past_days=92&forecast_days=1";
  const d = (await (await fetch(url)).json()).daily;
  const prev: { days: Record<string, Day> } = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { days: {} };
  for (const [k, v] of Object.entries(prev.days)) if (typeof v.tempF !== "number") delete prev.days[k];
  d.time.forEach((date: string, i: number) => {
    const precipMm = d.precipitation_sum[i] ?? 0;
    const tempF = d.temperature_2m_max[i];
    if (typeof tempF !== "number" || typeof d.weather_code[i] !== "number") return; // gaps stay simulated
    // A past day counts as rainy if at least 2 mm fell (the forecast uses rain probability instead).
    prev.days[date] = { tempF, code: d.weather_code[i], precipMm, condition: classify(d.weather_code[i], tempF, precipMm >= 2 ? 100 : 0) };
  });
  const out = { source: "Open-Meteo (open-meteo.com), Boston 42.36,-71.06, daily max temperature and precipitation", fetched: new Date().toISOString(), days: prev.days };
  writeFileSync(OUT, JSON.stringify(out, null, 1));
  const conds = Object.values(prev.days).reduce<Record<string, number>>((m, x) => ((m[x.condition] = (m[x.condition] ?? 0) + 1), m), {});
  console.log(Object.keys(prev.days).length, "days", conds);
}
main();
