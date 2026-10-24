import bench from "@/lib/benchmarks.json";
import { DEMO_PROFILES } from "@/lib/profile";

type Entry = { versions: { accuracy: number }[]; owner: number; ceiling: number; weeks: unknown[] };
const byRestaurant = bench.byRestaurant as Record<string, Entry>;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

// Benchmark numbers come straight from lib/benchmarks.json (npm run bench).
export function Accuracy() {
  const rows = DEMO_PROFILES.filter((p) => byRestaurant[p.id]).map((p) => {
    const b = byRestaurant[p.id];
    return { id: p.id, name: p.name, model: b.versions[b.versions.length - 1].accuracy, owner: b.owner, ceiling: b.ceiling };
  });
  const weeks = byRestaurant[rows[0]?.id]?.weeks.length ?? 12;

  return (
    <section aria-labelledby="accuracy" className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-20">
        <div className="min-w-0">
          <h2 id="accuracy" className="font-display text-3xl font-700 leading-tight text-text-primary">
            How close it gets
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary">
            Each demo kitchen is simulated, with hidden habits the model never reads. {weeks} weeks, {bench.seeds.length}{" "}
            seeds, scored only on nights it hadn&apos;t seen. Real accuracy needs a real kitchen.
          </p>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-text-muted">
                <th scope="col" className="py-3 pr-4 font-400">Kitchen</th>
                <th scope="col" className="px-4 py-3 text-right font-400">FreshCast</th>
                <th scope="col" className="px-4 py-3 text-right font-400">Owner&apos;s best guess</th>
                <th scope="col" className="py-3 pl-4 text-right font-400">Ceiling</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <th scope="row" className="py-4 pr-4 text-sm font-500 text-text-primary">{r.name}</th>
                  <td className="px-4 py-4 text-right font-display text-2xl font-700 tabular-nums text-good">{pct(r.model)}</td>
                  <td className="px-4 py-4 text-right text-base tabular-nums text-text-secondary">{pct(r.owner)}</td>
                  <td className="py-4 pl-4 text-right text-base tabular-nums text-text-secondary">{pct(r.ceiling)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Accuracy is 1 − WAPE by kilograms. The owner remembers the last 4 same weekdays exactly. The ceiling knows
            the hidden habits but not tonight&apos;s guests.
          </p>
        </div>
      </div>
    </section>
  );
}
