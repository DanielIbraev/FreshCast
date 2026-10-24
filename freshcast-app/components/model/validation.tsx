import { ChevronDown, FlaskConical } from "lucide-react";
import { CardLabel } from "@/components/ui/card";
import { VersionLadder } from "./version-ladder";
import { LearningCurve } from "./learning-curve";
import { EffortChart } from "./effort-chart";
import { Bench, pct, v4Of } from "./format";

function Notes() {
  const items: [string, string][] = [
    ["Accuracy = 1 − weighted absolute error (WAPE, by kg).", "Total kg the forecast missed by, divided by total kg wasted. Weighting by kg stops near-zero items like basil from swinging the score."],
    ["Walk-forward.", "Each morning the model sees only close-outs from earlier nights, the same as in a real kitchen."],
    ["Usual guests, no reservations.", "The forecast uses the kitchen's usual guest count for that weekday. There is no reservation feed, so a surprise rush is a miss."],
    ["Hidden truth.", "Each simulated kitchen has habits the model is never told: an item that is always over-prepped, a slow weekday, rain that hits harder than average."],
    ["Best possible (oracle).", "Knows the simulator's hidden parameters, but not tonight's guest count or the random noise. No forecaster can beat it on average."],
    ["Scope.", "1 simulated kitchen per restaurant × 5 random seeds, 12 weeks, scored on weeks 3–12. Accuracy in a real kitchen is untested until it runs in one."],
  ];
  return (
    <ul className="space-y-3 text-[13px] leading-relaxed text-text-secondary">
      {items.map(([head, body]) => (
        <li key={head}>
          <span className="text-text-primary">{head}</span> {body}
        </li>
      ))}
    </ul>
  );
}

export function Validation({ b, own, restaurantName }: { b: Bench; own: boolean; restaurantName: string }) {
  const none = b.effort.find((e) => e.id === "none");
  const rec = b.effort.find((e) => e.id === "all-pos");
  const weighed = b.effort.find((e) => e.id === "weighed-pos");
  const w3 = b.weeks.find((w) => w.week === 3);
  const v0 = b.versions[0].accuracy;
  const v4 = v4Of(b);
  const kitchen = own ? `${restaurantName}'s simulated kitchen` : "the Marco's Trattoria test kitchen";

  return (
    <details className="group rounded-card border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-6 py-5 transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-data [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="font-display text-lg font-600 text-text-primary">How we validated the model</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            {own ? "Benchmark" : "Benchmark on the Marco's Trattoria test kitchen"}: {pct(v0, 1)} for a rule of thumb, {pct(v4, 1)} for FreshCast, {pct(b.ceiling, 1)} best possible.
          </p>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
      </summary>

      <div className="space-y-8 border-t border-border px-6 pb-6 pt-6">
        <section>
          <h3 className="font-display text-base font-600 text-text-primary">Every version, same kitchen, same 12 weeks</h3>
          <p className="mt-0.5 text-sm text-text-secondary">Each step adds signals on top of the last. Run on {kitchen}, averaged over 5 random seeds.</p>
          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[640px]">
              <VersionLadder versions={b.versions} ceiling={b.ceiling} />
            </div>
          </div>
        </section>

        {none && rec && (
          <section>
            <h3 className="font-display text-base font-600 text-text-primary">How much staff time is worth it</h3>
            <p className="mb-5 mt-0.5 max-w-3xl text-sm text-text-secondary">
              Logging every item with quick-tap estimates plus guests served takes about {rec.minutes.toFixed(1)} minutes a night and lifts accuracy from{" "}
              {pct(none.accuracy, 1)} to {pct(rec.accuracy, 1)}.
              {weighed &&
                ` Weighing every item on a scale takes ${(weighed.minutes / rec.minutes).toFixed(1)}x as long for ${((weighed.accuracy - rec.accuracy) * 100).toFixed(1)} points more.`}
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <EffortChart rows={b.effort} recommended="all-pos" ceiling={b.ceiling} />
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.6fr_1fr]">
          <section>
            <h3 className="font-display text-base font-600 text-text-primary">Accuracy week by week</h3>
            <p className="mb-4 mt-0.5 text-sm text-text-secondary">
              {w3
                ? `By week 3 the learning model scored ${pct(w3.learned)}, against ${pct(w3.priorOnly)} for priors alone and ${pct(w3.ceiling)} best possible.`
                : "Priors alone stay flat. The learning model climbs as close-outs build."}
            </p>
            <LearningCurve weeks={b.weeks} />
          </section>
          <section>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-data" aria-hidden />
              <CardLabel>How this is scored</CardLabel>
            </div>
            <div className="mt-4">
              <Notes />
            </div>
          </section>
        </div>
      </div>
    </details>
  );
}
