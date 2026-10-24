// Proof, environmental impact, audience, competition, Kiro, team, try it.
import { Car, Leaf, Utensils } from "lucide-react";
import { Line, Source, Broll } from "./deck-story";
import { Matrix } from "./visuals";
import { QRCodeSVG } from "qrcode.react";
import { Mark } from "@/components/brand/mark";
import { SITE_URL } from "@/lib/site";

function Big({ icon: Icon, value, label }: { icon: typeof Leaf; value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <Icon className="h-14 w-14 text-good" strokeWidth={1.75} />
      <p className="mt-6 font-display text-[88px] font-800 leading-none tracking-tight tabular-nums text-text-primary">{value}</p>
      <p className="mt-4 text-[26px] leading-snug text-text-secondary">{label}</p>
    </div>
  );
}

export const S8Impact = ({ kgYear, co2Year, meals }: { kgYear: number; co2Year: number; meals: number }) => (
  <div className="relative isolate flex h-full flex-col justify-between">
    <Broll name="produce" />
    <Line>One restaurant, one year.</Line>
    <div className="grid grid-cols-3 gap-16">
      <Big icon={Utensils} value={Math.round(meals).toLocaleString()} label="meals' worth of food not bought and binned" />
      <Big icon={Leaf} value={`${co2Year.toFixed(1)} t`} label="CO₂e embodied in that food" />
      <Big icon={Car} value={Math.round((co2Year / 4.6) * 12).toString()} label="months of a car's CO₂" />
    </div>
    <Source>Marco&apos;s simulated last 30 days × 365/30. 1.2 lb = 1 meal (Feeding America). CO₂e: Poore & Nemecek 2018 via Our World in Data. 4.6 t CO₂ per car per year (EPA).</Source>
  </div>
);

export const S9Scale = ({ co2Year, meals }: { co2Year: number; meals: number }) => {
  const n = 4125; // 1% of 412,498 independent US restaurants (Technomic, 2025)
  return (
    <div className="relative isolate flex h-full flex-col justify-center">
      <Broll name="traffic" />
      <p className="mb-10 text-[30px] text-text-secondary">At just 1% of America&apos;s independent restaurants:</p>
      <p className="font-display text-[150px] font-800 leading-none tracking-tight tabular-nums text-good">{Math.round((co2Year * n) / 4.6).toLocaleString()}</p>
      <p className="mt-6 text-[40px] font-600 text-text-primary">cars&apos; worth of CO₂, every year.</p>
      <p className="mt-4 text-[28px] text-text-secondary">And {((meals * n) / 1e6).toFixed(0)} million meals&apos; worth of food not bought and binned.</p>
      <div className="absolute bottom-0 right-0">
        <Source>4,125 restaurants = 1% of 412,498 US independents (Technomic, 2025)</Source>
      </div>
    </div>
  );
};

export const S10Audience = () => (
  <div className="flex h-full items-center justify-between gap-16">
    <div className="max-w-[640px]">
      <Line sub="70% of US restaurants are single-location. Waste tools with cameras and scales are built for chains.">412,498 independent restaurants.</Line>
    </div>
    <div className="w-[600px] rounded-2xl border border-border bg-surface p-9">
      <p className="text-[22px] font-600 text-good">Who benefits</p>
      <ul className="mt-6 space-y-4 text-[26px] leading-snug text-text-secondary">
        <li><span className="text-text-primary">Owners</span> on 3–5% margins who can&apos;t buy hardware</li>
        <li><span className="text-text-primary">Closing staff</span>, in English or Español, on the phone they have</li>
        <li><span className="text-text-primary">Everyone else</span>: less food rotting into methane</li>
      </ul>
    </div>
  </div>
);

export const S12Competition = () => (
  <div className="flex h-full flex-col justify-between">
    <Line>Hardware trackers weigh the trash. We stop it being made.</Line>
    <div className="flex justify-center pb-6">
      <Matrix />
    </div>
  </div>
);

export const S13Team = () => (
  <div className="flex h-full items-center gap-20">
    <div className="flex h-[360px] w-[360px] shrink-0 items-center justify-center rounded-3xl border border-border bg-surface">
      <span className="font-display text-[140px] font-800 text-good">DI</span>
    </div>
    <div>
      <p className="font-display text-[64px] font-700 leading-tight text-text-primary">Daniel Ibraev</p>
      <ul className="mt-8 space-y-5 text-[30px] leading-snug text-text-secondary">
        <li>Worked at a small cafe. Watched the bin fill up every night.</li>
        <li>Built FreshCast end to end today: model, app, database.</li>
        <li>Next: run it in a real kitchen and measure it against a scale.</li>
      </ul>
      <p className="mt-10 flex items-center gap-3 text-[22px] text-text-muted">
        <span className="rounded-md border border-border px-2.5 py-1 font-display text-lg font-700 text-text-primary">Kiro</span>
        Built solo in one day, entirely in Kiro: plan, code, tests, docs and this deck.
      </p>
    </div>
  </div>
);

// Closing card: where judges can test it. The rules require a working link.
export const S14Try = () => (
  <div className="flex h-full items-center justify-between gap-16">
    <div className="max-w-[820px]">
      <div className="mb-10 flex items-center gap-4">
        <Mark size={56} />
        <span className="font-display text-4xl font-700 text-text-primary">FreshCast</span>
      </div>
      <h2 className="font-display text-[84px] font-700 leading-[1.02] tracking-tight text-text-primary">Try it on your phone.</h2>
      <p className="mt-8 text-[30px] leading-snug text-text-secondary">No login. Switch between the three demo kitchens, or set up any restaurant from a map search.</p>
      <dl className="mt-12 grid grid-cols-[150px_1fr] gap-y-3 text-[24px]">
        <dt className="text-text-muted">Live app</dt>
        <dd className="text-text-primary">{SITE_URL.replace("https://", "")}</dd>
        <dt className="text-text-muted">Code</dt>
        <dd className="text-text-primary">github.com/DanielIbraev/FreshCast</dd>
        <dt className="text-text-muted">Track</dt>
        <dd className="text-text-primary">Climate Tech</dd>
      </dl>
    </div>
    <div className="shrink-0 rounded-2xl bg-white p-6">
      <QRCodeSVG value={`${SITE_URL}/dashboard`} size={320} level="M" bgColor="#FFFFFF" fgColor="#0F1117" />
    </div>
  </div>
);

// Proof it's real engineering, not a mockup.
export const S7bTrust = ({ coverage }: { coverage: number }) => {
  const tiles: [string, string, string][] = [
    [`${Math.round(coverage * 100)}%`, "of simulated nights land inside the 80% range", "Calibrated uncertainty, not a guess"],
    ["60", "automated tests, 13 property-based", "Caught 2 real bugs before launch"],
    ["0", "writes allowed from the public", "Postgres row-level security"],
    ["9", "signals per forecast, 1 live feed", "Live weather, usual guests, calendar, your logs"],
  ];
  return (
    <div className="relative flex h-full flex-col justify-between">
      <Line>Not a black box.</Line>
      <div className="grid grid-cols-4 gap-8">
        {tiles.map(([v, l, s]) => (
          <div key={l} className="rounded-2xl border border-border bg-surface p-8">
            <p className="font-display text-[80px] font-800 leading-none tracking-tight tabular-nums text-good">{v}</p>
            <p className="mt-5 text-[24px] leading-snug text-text-primary">{l}</p>
            <p className="mt-3 text-[18px] text-text-muted">{s}</p>
          </div>
        ))}
      </div>
      <Source>Public data: Open-Meteo weather · OpenStreetMap geocoding · Poore & Nemecek / Our World in Data CO₂e factors · Feeding America · EPA</Source>
    </div>
  );
};

// Implementation: Kiro did all of it. No brand names besides Kiro on screen
// (the video rules ban third-party trademarks).
export const S12bKiro = () => {
  const tiles: [string, string, string][] = [
    ["Plan", "Idea, research, sourced stats", "Web search inside Kiro, 7 steering docs"],
    ["Spec", "Requirements → design → tasks", "Confidence ranges: 73% → 79% coverage"],
    ["Build", "Every line of code", "Model, app, database, 60 tests"],
    ["Check", "13 property tests, a subagent audit", "Found 2 bugs and 5 model errors"],
    ["Ship", "3 hooks, 200+ auto-pushed commits", "Tests and re-scoring on every save"],
    ["Pitch", "This deck and the video plan", "Design skill checked every slide"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-12">
      <div className="flex items-center gap-6">
        <span className="rounded-xl border-2 border-text-primary px-5 py-2 font-display text-[44px] font-700 tracking-tight text-text-primary">Kiro</span>
        <Line>One builder. One tool. All of it.</Line>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {tiles.map(([h, a, b]) => (
          <div key={h} className="rounded-2xl border border-border bg-surface p-7">
            <p className="font-display text-[36px] font-700 text-good">{h}</p>
            <p className="mt-3 text-[24px] leading-snug text-text-primary">{a}</p>
            <p className="mt-2 text-[19px] leading-snug text-text-muted">{b}</p>
          </div>
        ))}
      </div>
      <p className="text-[24px] text-text-secondary">No second chatbot for ideas, no other coding assistant. Planning, code, tests, docs and this deck were all done in Kiro.</p>
    </div>
  );
};
