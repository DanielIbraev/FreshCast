"use client";

import { useEffect, useState } from "react";
import type { DayPrediction } from "@/lib/types";
import type { Profile } from "@/lib/profile";
import { parseLocalDate } from "@/lib/demo-data";

const stamp = () => new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

// The paper version of the prep list: hidden on screen, the only thing on the
// page when printed. Black on white, a box per row for the cook to tick.
export function PrintSheet({ day, profile }: { day: DayPrediction; profile: Profile }) {
  // Set on the client (no hydration mismatch) and refreshed when printing.
  const [generated, setGenerated] = useState("");
  useEffect(() => {
    const update = () => setGenerated(stamp());
    update();
    window.addEventListener("beforeprint", update);
    return () => window.removeEventListener("beforeprint", update);
  }, []);

  const date = parseLocalDate(day.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const total = day.ingredients.reduce(
    (t, p) => ({ usual: t.usual + p.usualPrepKg, rec: t.rec + p.recommendedPrepKg }),
    { usual: 0, rec: 0 }
  );

  return (
    <section className="hidden bg-white font-sans text-black print:!mt-0 print:block print:!animate-none">
      <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-3">
        <div>
          <h1 className="font-display text-2xl font-700 leading-tight">{profile.name}</h1>
          <p className="text-sm text-black/70">{profile.address}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-700 leading-tight">Prep list</p>
          <p className="text-sm">{date}</p>
        </div>
      </header>

      <dl className="mt-3 flex gap-10 text-sm">
        <div>
          <dt className="text-black/60">Weather</dt>
          <dd className="font-600">
            {day.weather.description}, {Math.round(day.weather.tempF)}°F
          </dd>
        </div>
        <div>
          <dt className="text-black/60">Guests expected</dt>
          <dd className="font-600">
            {day.expectedCovers}
            {day.expectedCovers !== day.usualCovers && <span className="font-400 text-black/60"> (usually {day.usualCovers})</span>}
          </dd>
        </div>
      </dl>

      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black text-left text-xs text-black/60">
            <th className="w-8 pb-1.5 font-500"><span className="sr-only">Done</span></th>
            <th className="pb-1.5 font-500">Ingredient</th>
            <th className="pb-1.5 text-right font-500">Usual</th>
            <th className="pb-1.5 text-right font-500">Prep today</th>
            <th className="pb-1.5 text-right font-500">Less</th>
            <th className="pb-1.5 pl-6 font-500">Reason</th>
          </tr>
        </thead>
        <tbody>
          {day.ingredients.map((p) => (
            <tr key={p.ingredient.id} className="break-inside-avoid border-b border-black/25 align-top">
              <td className="py-2.5">
                <span className="block h-4 w-4 border-[1.5px] border-black" />
              </td>
              <td className="py-2.5 font-500">{p.ingredient.name}</td>
              <td className="py-2.5 text-right tabular-nums text-black/60">{p.usualPrepKg.toFixed(1)} kg</td>
              <td className="py-2.5 text-right text-base font-700 tabular-nums">{p.recommendedPrepKg.toFixed(1)} kg</td>
              <td className="py-2.5 text-right tabular-nums">{(p.usualPrepKg - p.recommendedPrepKg).toFixed(1)} kg</td>
              <td className="py-2.5 pl-6 text-xs leading-snug text-black/75">
                {p.primaryDriver.label}: {p.primaryDriver.detail}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black">
            <td />
            <td className="py-2.5 font-700">Total</td>
            <td className="py-2.5 text-right tabular-nums text-black/60">{total.usual.toFixed(1)} kg</td>
            <td className="py-2.5 text-right text-base font-700 tabular-nums">{total.rec.toFixed(1)} kg</td>
            <td className="py-2.5 text-right font-600 tabular-nums">{(total.usual - total.rec).toFixed(1)} kg</td>
            <td />
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 flex gap-10 text-sm">
        <p className="flex-1 border-t border-black pt-1 text-black/60">Prepped by</p>
        <p className="w-40 border-t border-black pt-1 text-black/60">Time</p>
      </div>

      <footer className="mt-8 text-xs text-black/60">FreshCast, generated {generated}</footer>
    </section>
  );
}
