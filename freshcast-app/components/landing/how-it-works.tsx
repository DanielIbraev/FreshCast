import { EquationFlow } from "@/components/landing/equation-flow";
import { BASE_WASTE_FRACTION, REDUCTION_RATE } from "@/lib/prediction";

const pct = (x: number) => `${Math.round(x * 100)}%`;

// The forecast equation in plain words, read from the same constants the model uses.
const TERMS = [
  { op: "", title: "Normal waste", body: `${pct(BASE_WASTE_FRACTION)} of the usual prep` },
  { op: "×", title: "The day", body: "Live weather, season, holidays, shelf life" },
  { op: "×", title: "Your kitchen", body: "Learned from a one-minute nightly close-out" },
  { op: "=", title: "Likely waste", body: "Per ingredient, with an 80% range", result: true },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-32">
        <h2 id="how" className="max-w-3xl font-display text-4xl font-700 lg:text-5xl leading-tight text-text-primary">
          How it works: one multiplication
        </h2>

        <EquationFlow terms={TERMS} />

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-text-primary">
          Then prep <span className="font-700 text-good">{pct(REDUCTION_RATE)} of that</span> less. The rest is a buffer.
        </p>
      </div>
    </section>
  );
}
