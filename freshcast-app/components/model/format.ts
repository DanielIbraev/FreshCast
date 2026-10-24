// Shared helpers for the Model accuracy page: number formatting, chart chrome,
// and the per-restaurant benchmark lookup.
import bench from "@/lib/benchmarks.json";
import { parseLocalDate } from "@/lib/demo-data";
import { TrackRecord } from "@/lib/track-record";

export const pct = (v: number | null | undefined, digits = 0) => (v === null || v === undefined ? "–" : `${(v * 100).toFixed(digits)}%`);
export const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

export const shortDate = (iso: string) => {
  const d = parseLocalDate(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const axisTick = { fill: "#64748B", fontSize: 11 };
export const tooltipStyle = { background: "#1A1D27", border: "1px solid #2D3748", borderRadius: 8, color: "#E2E8F0", fontSize: 12 };

export type Bench = (typeof bench.byRestaurant)["marcos-trattoria"];

// The benchmark run for this restaurant's simulated kitchen. Restaurants the
// visitor created have none, so they get Marco's, labelled as such.
export function benchFor(id: string): { b: Bench; own: boolean } {
  const all = bench.byRestaurant as Record<string, Bench | undefined>;
  const b = all[id];
  return b ? { b, own: true } : { b: all["marcos-trattoria"] ?? (bench as unknown as Bench), own: false };
}

export const v4Of = (b: Bench) => b.versions[b.versions.length - 1].accuracy;

// Night-level view of the last 4 weeks: how many nights the real number
// landed inside the forecast band, and the typical dollar miss.
export function lastNights(tr: TrackRecord, n = 28) {
  const xs = tr.nights.filter((x) => x.scoredItems > 0).slice(-n);
  const inside = xs.filter((x) => x.actualCost >= x.lowCost && x.actualCost <= x.highCost).length;
  const avgMiss = xs.length ? xs.reduce((s, x) => s + Math.abs(x.forecastCost - x.actualCost), 0) / xs.length : 0;
  const avgActual = xs.length ? xs.reduce((s, x) => s + x.actualCost, 0) / xs.length : 0;
  return { count: xs.length, inside, avgMiss, avgActual };
}
