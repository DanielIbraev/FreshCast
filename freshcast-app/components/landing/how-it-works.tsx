import { BASE_WASTE_FRACTION, REDUCTION_RATE } from "@/lib/prediction";

const pct = (x: number) => `${Math.round(x * 100)}%`;

// The forecast equation in plain words, read from the same constants the model uses.
const TERMS = [
  { op: "", title: "Normal waste", body: `${pct(BASE_WASTE_FRACTION)} of the usual prep for that weekday` },
  { op: "×", title: "The day", body: "Live weather, season, holidays and each item's shelf life" },
  { op: "×", title: "Your kitchen", body: "Learned from a one-minute close-out each night" },
  { op: "=", title: "Likely waste", body: "Per ingredient, with an 80% range", result: true },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 id="how" className="max-w-xl font-display text-3xl font-700 leading-tight text-text-primary">
          How the forecast works
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">
          One multiplication per ingredient. No chatbot, and every factor is on screen in the app.
        </p>

        <ol className="mt-10 grid overflow-hidden rounded-lg border border-border md:grid-cols-4">
          {TERMS.map((t, i) => (
            <li
              key={t.title}
              className={`min-w-0 p-6 ${i > 0 ? "border-t border-border md:border-l md:border-t-0" : ""} ${t.result ? "bg-surface" : ""}`}
            >
              <p className="flex items-baseline gap-2 font-display text-xl font-600 text-text-primary">
                {t.op && (
                  <span className="text-2xl font-400 text-text-muted" aria-hidden>
                    {t.op}
                  </span>
                )}
                <span className={t.result ? "text-waste" : undefined}>{t.title}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{t.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-text-primary">
          Then the plan preps <span className="font-600 text-good">{pct(REDUCTION_RATE)} of that</span> less. The
          other {pct(1 - REDUCTION_RATE)} stays as a buffer so the kitchen doesn&apos;t run out.
        </p>
      </div>
    </section>
  );
}
