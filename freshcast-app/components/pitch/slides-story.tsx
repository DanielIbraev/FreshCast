// Slides 1-5: hook, evidence, why existing tools fail, the demo cue.
import { Check, Leaf, X } from "lucide-react";
import { Eyebrow, Panel, Stat, Title } from "./primitives";
import { formatCurrency } from "@/lib/utils";

export function TitleSlide() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-good">
          <Leaf className="h-7 w-7 text-canvas" strokeWidth={2.5} />
        </div>
        <span className="font-display text-3xl font-700 text-text-primary">FreshCast</span>
      </div>
      <h1 className="max-w-[900px] font-display text-[80px] font-800 leading-[1.02] tracking-tight text-text-primary">
        Forecast tomorrow&apos;s food waste <span className="text-good">before it&apos;s cooked.</span>
      </h1>
      <p className="mt-8 text-xl text-text-secondary">Daniel Ibraev · Hackachusetts 2026 · Climate Tech</p>
    </div>
  );
}

export function HookSlide() {
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>Quick question</Eyebrow>
      <Title className="text-[72px]">Who here has worked in a restaurant?</Title>
      <p className="mt-12 max-w-[820px] text-2xl leading-relaxed text-text-secondary">
        I worked at a small cafe. Every night, food we prepped that morning went in the trash. The owner never knew what it cost him, and he had no way to find out.
      </p>
    </div>
  );
}

export function ProblemSlide({ monthlyBefore }: { monthlyBefore: number | null }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>The problem</Eyebrow>
      <Title>Restaurants guess how much to prep. The bin pays for the misses.</Title>
      <div className="mt-14 grid grid-cols-4 gap-10">
        <Stat value="$162B" tone="waste" label="of food US restaurants throw away each year" source="Forbes, Mar 2026" />
        <Stat value="4–10%" tone="waste" label="of the food a restaurant buys ends up as waste" source="Galley Solutions" />
        <Stat value="3–5%" label="typical restaurant profit margin" source="GoFoodService" />
        <Stat value="8–10%" label="of global greenhouse gas comes from food loss and waste" source="UNFCCC / FAO" />
      </div>
      {monthlyBefore && (
        <p className="mt-14 text-xl text-text-secondary">
          Our demo kitchen, a 60-seat Italian place in the North End, binned <span className="font-600 text-waste">{formatCurrency(monthlyBefore)} a month</span> before FreshCast.
        </p>
      )}
    </div>
  );
}

const ROWS: [string, string, string][] = [
  ["Upfront cost", "$3,000–8,000 hardware", "$0, runs on the tablet they own"],
  ["Who it's for", "Hotels, campuses, chains", "One independent restaurant"],
  ["Setup", "Technician install", "5 minutes"],
  ["When it acts", "After food hits the bin", "Before prep starts"],
];

export function CompetitionSlide() {
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>Why nobody has fixed this for them</Eyebrow>
      <Title>The tools exist. They were built for someone else.</Title>
      <Panel className="mt-12 p-0">
        <div className="grid grid-cols-[220px_1fr_1fr] border-b border-border px-8 py-4 text-sm uppercase tracking-wider text-text-muted">
          <span />
          <span>Winnow, Leanpath, Orbisk</span>
          <span className="text-good">FreshCast</span>
        </div>
        {ROWS.map(([k, them, us]) => (
          <div key={k} className="grid grid-cols-[220px_1fr_1fr] items-center border-b border-border px-8 py-5 text-xl last:border-0">
            <span className="text-text-muted">{k}</span>
            <span className="flex items-center gap-3 text-text-secondary">
              <X className="h-5 w-5 text-waste" /> {them}
            </span>
            <span className="flex items-center gap-3 text-text-primary">
              <Check className="h-5 w-5 text-good" /> {us}
            </span>
          </div>
        ))}
      </Panel>
      <p className="mt-8 text-xl text-text-secondary">About 70% of US restaurants are independent. None of these tools are priced for them.</p>
    </div>
  );
}

export function DemoSlide() {
  const steps = ["Forecast tomorrow from live Boston weather", "See exactly why the model flagged an ingredient", "Change the guests and the weather, apply the prep plan", "Log waste in two taps, close out the night"];
  return (
    <div className="flex h-full flex-col justify-center">
      <Eyebrow>Live demo</Eyebrow>
      <Title>Meet Marco. It&apos;s Sunday night, and he&apos;s planning tomorrow&apos;s prep.</Title>
      <ol className="mt-12 space-y-5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-5 text-2xl text-text-secondary">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border font-display text-lg font-700 text-good">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <a href="/dashboard" className="mt-12 inline-flex w-fit items-center gap-2 rounded-md bg-good px-6 py-3 text-lg font-600 text-canvas hover:bg-good-dim">
        Open FreshCast
      </a>
    </div>
  );
}
