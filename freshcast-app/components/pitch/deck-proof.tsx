// Slides 7-14: proof, environmental impact, audience, business, competition, team, ask.
import { Car, Leaf, MapPin, Utensils } from "lucide-react";
import { Line, Source, Broll } from "./deck-story";
import { VersusBars, Matrix, SavingsBar } from "./visuals";
import { Mark } from "@/components/brand/mark";

export const S7Proof = ({ owner, us }: { owner: number; us: number }) => (
  <div className="relative flex h-full flex-col justify-between">
    <Line>
      Better than the owner&apos;s own gut. <span className="text-good">{Math.round((1 - (1 - us) / (1 - owner)) * 100)}% fewer misses.</span>
    </Line>
    <VersusBars owner={owner} us={us} />
    <Source>12-week walk-forward test on 5 simulated kitchens. Owner baseline: remembers exactly what was wasted the last 4 same weekdays.</Source>
  </div>
);

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
      <Big icon={Utensils} value={Math.round(meals).toLocaleString()} label="meals of food never wasted" />
      <Big icon={Leaf} value={`${co2Year.toFixed(1)} t`} label="CO₂e kept out of the air" />
      <Big icon={Car} value={Math.round((co2Year / 4.6) * 12).toString()} label="months of a car's emissions" />
    </div>
    <Source>From Marco&apos;s last 30 days, annualized. 1.2 lb = 1 meal (USDA). 4.6 t CO₂e per car per year (EPA).</Source>
  </div>
);

export const S9Scale = ({ co2Year, meals }: { co2Year: number; meals: number }) => {
  const n = 4125; // 1% of 412,498 independent US restaurants (Technomic, 2025)
  return (
    <div className="relative isolate flex h-full flex-col justify-center">
      <Broll name="traffic" />
      <p className="mb-10 text-[30px] text-text-secondary">At just 1% of America&apos;s independent restaurants:</p>
      <p className="font-display text-[150px] font-800 leading-none tracking-tight tabular-nums text-good">{Math.round((co2Year * n) / 4.6).toLocaleString()}</p>
      <p className="mt-6 text-[40px] font-600 text-text-primary">cars&apos; worth of emissions, gone. Every year.</p>
      <p className="mt-4 text-[28px] text-text-secondary">And {((meals * n) / 1e6).toFixed(0)} million meals of food that never hit a landfill.</p>
      <div className="absolute bottom-0 right-0">
        <Source>4,125 restaurants = 1% of 412,498 US independents (Technomic, 2025)</Source>
      </div>
    </div>
  );
};

export const S10Audience = () => (
  <div className="flex h-full items-center justify-between gap-16">
    <div className="max-w-[640px]">
      <Line sub="70% of US restaurants are single-location. Nobody builds waste tools for them.">412,498 independent restaurants.</Line>
    </div>
    <div className="w-[600px] rounded-2xl border border-border bg-surface p-9">
      <p className="text-lg uppercase tracking-[0.15em] text-good">First customer</p>
      <p className="mt-4 font-display text-[40px] font-700 leading-tight text-text-primary">Owner who still works the line</p>
      <ul className="mt-6 space-y-3 text-2xl text-text-secondary">
        <li>30–80 seats, cooks fresh every day</li>
        <li>Already on Square or Toast</li>
        <li>Orders from Restaurant Depot on Mondays</li>
      </ul>
      <p className="mt-6 flex items-center gap-2 text-2xl text-text-primary">
        <MapPin className="h-6 w-6 text-good" /> North End & South End, Boston
      </p>
    </div>
  </div>
);

export const S11Business = ({ saved }: { saved: number }) => (
  <div className="flex h-full flex-col justify-center gap-16">
    <Line sub="Monthly subscription. No hardware to ship, install, or repair.">
      $49 a month. <span className="text-good">Pays for itself in {Math.max(1, Math.round(49 / (saved / 30)))} days.</span>
    </Line>
    <SavingsBar saved={saved} price={49} />
  </div>
);

export const S12Competition = () => (
  <div className="flex h-full flex-col justify-between">
    <Line>Everyone else weighs the trash. We stop it being made.</Line>
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
        <li>Next: in restaurants, talking to owners, selling it myself.</li>
      </ul>
    </div>
  </div>
);

export const S14Ask = () => (
  <div className="flex h-full flex-col justify-center">
    <p className="mb-8 text-[30px] text-text-muted">One ask:</p>
    <h2 className="font-display text-[88px] font-800 leading-[1.02] tracking-tight text-text-primary">
      Introduce me to one <span className="text-good">restaurant owner.</span>
    </h2>
    <p className="mt-10 text-[30px] text-text-secondary">Goal: 3 Boston pilots by December.</p>
    <div className="mt-16 flex items-center gap-4">
      <Mark size={48} />
      <span className="font-display text-3xl font-700 text-text-primary">FreshCast</span>
      <span className="ml-4 text-2xl text-text-muted">github.com/DanielIbraev/FreshCast</span>
    </div>
  </div>
);
