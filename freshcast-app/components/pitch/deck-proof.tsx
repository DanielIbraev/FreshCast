// Proof, environmental impact, audience, competition.
import { Car, Leaf, Utensils } from "lucide-react";
import { Line, Source, Broll } from "./deck-story";
import { Matrix } from "./visuals";
import { PROPERTIES, TESTS } from "./deck-close";

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
    <Source>Marco&apos;s simulated last 30 days × 365/30. 1 meal = 1.2 lb (Feeding America). CO₂e: Poore & Nemecek 2018, Our World in Data. A car: 4.6 t CO₂ a year (EPA).</Source>
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

const WHO: [string, string][] = [
  ["Owners", "on 3–5% margins, who can't buy hardware"],
  ["Closing staff", "in English or Español, on the phone they have"],
  ["Everyone else", "less food rotting into methane"],
];

export const S10Audience = () => (
  <div className="flex h-full flex-col justify-between">
    <Line sub="70% of US restaurants are single-location. Waste tools with cameras and scales are built for chains.">412,498 independent restaurants.</Line>
    <dl className="grid grid-cols-3 gap-12">
      {WHO.map(([who, why]) => (
        <div key={who} className="border-t-2 border-good pt-6">
          <dt className="font-display text-[40px] font-700 text-text-primary">{who}</dt>
          <dd className="mt-3 text-[26px] leading-snug text-text-secondary">{why}</dd>
        </div>
      ))}
    </dl>
    <Source>Independent restaurant count and share: Technomic, 2025. Margins: GoFoodService.</Source>
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

// Proof it's real engineering, not a mockup.
export const S7bTrust = ({ coverage }: { coverage: number }) => {
  const tiles: [string, string, string][] = [
    [`${Math.round(coverage * 100)}%`, "of simulated nights land inside the 80% range", "Calibrated uncertainty, not a guess"],
    [String(TESTS), `automated tests, ${PROPERTIES} property-based`, "Caught 2 real bugs before launch"],
    ["0", "writes allowed from the public", "Postgres row-level security"],
    ["9", "signals per forecast, 1 live feed", "Live weather, usual guests, calendar, your logs"],
  ];
  return (
    <div className="relative flex h-full flex-col justify-between">
      <Line>Not a black box.</Line>
      <div className="grid grid-cols-2 gap-6">
        {tiles.map(([v, l, s]) => (
          <div key={l} className="flex items-center gap-8 rounded-2xl border border-border bg-surface px-8 py-7">
            <p className="w-[170px] shrink-0 font-display text-[80px] font-800 leading-none tracking-tight tabular-nums text-good">{v}</p>
            <div>
              <p className="text-[26px] leading-snug text-text-primary">{l}</p>
              <p className="mt-2 text-[20px] leading-snug text-text-muted">{s}</p>
            </div>
          </div>
        ))}
      </div>
      <Source>Public data: Open-Meteo weather, OpenStreetMap geocoding, CO₂e factors from Poore & Nemecek via Our World in Data, Feeding America, EPA.</Source>
    </div>
  );
};
