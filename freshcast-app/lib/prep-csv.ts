import type { DayPrediction } from "./types";

// One CSV cell. Quotes when needed (RFC 4180) and defuses text that a
// spreadsheet would run as a formula (=, +, -, @ at the start).
function cell(v: string | number): string {
  if (typeof v === "number") return String(v);
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

export const PREP_CSV_HEADER = ["Ingredient", "Category", "Usual prep (kg)", "Prep today (kg)", "Less (kg)", "Saved ($)", "Reason"];

export function prepListCsv(day: DayPrediction): string {
  const rows = day.ingredients.map((p) => {
    const less = p.usualPrepKg - p.recommendedPrepKg;
    return [
      p.ingredient.name,
      p.ingredient.category,
      +p.usualPrepKg.toFixed(1),
      +p.recommendedPrepKg.toFixed(1),
      +less.toFixed(1),
      +(less * p.ingredient.costPerKg).toFixed(2),
      `${p.primaryDriver.label}: ${p.primaryDriver.detail}`,
    ];
  });
  return [PREP_CSV_HEADER, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

// Browser download. The BOM makes Excel read UTF-8 names (café, CO₂) correctly.
export function downloadPrepCsv(day: DayPrediction, restaurantId: string) {
  const blob = new Blob(["\uFEFF" + prepListCsv(day)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prep-list-${restaurantId}-${day.date}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
