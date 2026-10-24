// Slides 6-11: how it works, accuracy, results, scale, honesty, Kiro.
import { Eyebrow, Panel, Stat, Title } from "./primitives";
import { VersionLadder } from "@/components/model/version-ladder";
import { VersionResult } from "@/lib/backtest";
import { Summary } from "@/lib/history";
import { formatCurrency } from "@/lib/utils";

export function HowSlide() {
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>How it works</Eyebrow>
      <Title>Industry priors on day one. Your kitchen&apos;s habits by week two.</Title>
      <div className="mt-12 grid grid-cols-2 gap-6">
        <Panel>
          <p className="text-sm uppercase tracking-wider text-text-muted">Forecast, per ingredient per day</p>
          <p className="mt-4 font-mono text-[22px] leading-relaxed text-text-primary">
            waste = prep × 8% × <span className="text-data">∏ priors</span> × <span className="text-good">∏ learned</span>
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            <span className="text-data">Priors:</span> guests, live weather, weekday, season, holidays, nearby events, cuisine.
            <br />
            <span className="text-good">Learned:</span> per-ingredient, per-weekday, and per-weather corrections, plus last week.
          </p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-wider text-text-muted">Learning from nightly logs</p>
          <p className="mt-4 font-mono text-[22px] leading-relaxed text-text-primary">
            c = (Σ rᵢ + k) / (n + k), rᵢ = actual ÷ prior
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            A shrunk mean: with few logs it stays near 1.0, so one bad night can&apos;t swing tomorrow. No LLM touches a number.
          </p>
        </Panel>
      </div>
      <p className="mt-8 text-lg text-text-muted">Next.js · TypeScript model · Supabase Postgres with row-level security · Open-Meteo</p>
    </div>
  );
}

export function AccuracySlide({ versions, ceiling }: { versions: VersionResult[] | null; ceiling: number }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>Does it work?</Eyebrow>
      <Title>Every version, scored the same way, on the same 12 weeks.</Title>
      <Panel className="mt-10">{versions ? <VersionLadder versions={versions} ceiling={ceiling} /> : <div className="h-64 animate-pulse rounded bg-canvas" />}</Panel>
      <p className="mt-6 text-lg leading-relaxed text-text-secondary">
        Walk-forward: each day is forecast only from earlier days. The test kitchen has habits the model is never told. We stop near 90% because about 10% of daily waste is random.
      </p>
    </div>
  );
}

export function ResultsSlide({ sum }: { sum: Summary }) {
  const yearly = sum.monthlyBefore && sum.monthlyNow ? (sum.monthlyBefore - sum.monthlyNow) * 12 : 0;
  const drop = sum.monthlyBefore && sum.monthlyNow ? Math.round((1 - sum.monthlyNow / sum.monthlyBefore) * 100) : 0;
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>Before and after</Eyebrow>
      <Title>{drop}% less food in Marco&apos;s bin.</Title>
      <div className="mt-14 grid grid-cols-4 gap-10">
        <Stat value={formatCurrency(sum.monthlyBefore ?? 0)} tone="waste" label="wasted per month before the plan" />
        <Stat value={formatCurrency(sum.monthlyNow ?? 0)} tone="good" label="wasted per month now" />
        <Stat value={formatCurrency(yearly)} tone="good" label="kept per year" />
        <Stat value={`${Math.round(yearly / 588)}x`} label="return on $49 a month" />
      </div>
      <p className="mt-14 text-lg text-text-muted">From {sum.daysLogged} nightly close-outs stored in Supabase.</p>
    </div>
  );
}

export function ScaleSlide({ sum }: { sum: Summary }) {
  const tonsPerRestaurant = (sum.co2Last30 * 12) / 1000;
  const n = 5000; // 1% of ~500k independent US restaurants
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>At 1% of independent restaurants</Eyebrow>
      <Title>5,000 kitchens. One forecast each morning.</Title>
      <div className="mt-14 grid grid-cols-3 gap-10">
        <Stat value={`${tonsPerRestaurant.toFixed(1)}t`} tone="good" label="CO₂e kept out of landfill per restaurant per year" />
        <Stat value={`${Math.round((tonsPerRestaurant * n) / 1000).toLocaleString()}k t`} tone="good" label={`CO₂e per year, about ${Math.round((tonsPerRestaurant * n) / 4.6).toLocaleString()} cars off the road`} source="EPA: 4.6t per car per year" />
        <Stat value={formatCurrency(n * 588)} label="annual revenue at $49 a month" />
      </div>
      <p className="mt-14 text-xl text-text-secondary">For a restaurant on a 4% margin, that waste is the difference between staying open and closing. That&apos;s a resilient community.</p>
    </div>
  );
}

export function HonestSlide() {
  const cols: [string, string, string[]][] = [
    ["Real today", "text-good", ["Prediction engine and learning layer", "Live 7-day weather (Open-Meteo)", "Supabase storage, nightly close-outs", "Walk-forward accuracy benchmark"]],
    ["Simulated", "text-caution", ["Marco's 12 weeks of history", "The benchmark kitchen's hidden habits", "Guest counts (fixed by weekday)"]],
    ["Next", "text-data", ["Toast and OpenTable integrations for guest counts", "Pilot with 3 North End restaurants", "Accounts and multi-location"]],
  ];
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>What&apos;s real, what&apos;s next</Eyebrow>
      <Title>Built in 12 hours. Here&apos;s exactly where it stands.</Title>
      <div className="mt-12 grid grid-cols-3 gap-6">
        {cols.map(([h, c, items]) => (
          <Panel key={h}>
            <p className={`text-sm font-600 uppercase tracking-wider ${c}`}>{h}</p>
            <ul className="mt-5 space-y-3 text-lg text-text-secondary">
              {items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function KiroSlide() {
  const items: [string, string][] = [
    ["Steering", "7 rule files: model, UI, pitch, plus an anti-AI-slop design filter every screen was built against"],
    ["Hooks", "Every save commits and pushes. The git log is a timeline of the build."],
    ["MCP", "A PowerPoint server generated the backup deck from the same numbers"],
    ["Research", "Every stat, the competitor teardown, and the design references came from Kiro's web search"],
  ];
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>Built solo with Kiro</Eyebrow>
      <Title>One builder. Kiro as the team.</Title>
      <div className="mt-12 grid grid-cols-2 gap-6">
        {items.map(([h, t]) => (
          <Panel key={h}>
            <p className="font-display text-2xl font-700 text-text-primary">{h}</p>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">{t}</p>
          </Panel>
        ))}
      </div>
      <p className="mt-12 font-display text-3xl font-700 text-text-primary">
        Daniel Ibraev · <span className="text-good">github.com/DanielIbraev/FreshCast</span>
      </p>
    </div>
  );
}
