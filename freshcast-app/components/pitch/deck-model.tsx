"use client";
// Slides that explain the model simply: how one forecast is built (with the
// real numbers from tonight's forecast), how accurate it is in three very
// different kitchens, and what comes next.
import { motion } from "framer-motion";
import { Croissant, Salad, UtensilsCrossed } from "lucide-react";
import { Line, Source } from "./deck-story";
import { IngredientPrediction } from "@/lib/types";
import bench from "@/lib/benchmarks.json";
import { BASE_WASTE_FRACTION, REDUCTION_RATE } from "@/lib/prediction";

const ease = [0.22, 1, 0.36, 1] as const;
const x = (v: number) => `×${v.toFixed(2)}`;

// One forecast, three groups of factors. Numbers come from the live model.
export const S6bHow = ({ item, day }: { item: IngredientPrediction | null; day: string }) => {
  if (!item) return <Line>How a forecast is built.</Line>;
  const v = (k: string) => item.signals.find((s) => s.key === k)?.value ?? 1;
  const world = v("demand") * v("weather") * v("season") * v("holiday") * v("event") * v("shelfLife");
  const kitchen = v("calibration") * v("dayOfWeek") * v("recency");
  const steps = [
    { top: `${(item.usualPrepKg * BASE_WASTE_FRACTION).toFixed(2)} kg`, mid: "Normal waste", sub: `${Math.round(BASE_WASTE_FRACTION * 100)}% of the ${item.usualPrepKg.toFixed(1)} kg usually prepped on ${day}` },
    { top: x(world), mid: "The day", sub: `${(item.signals.find((s) => s.key === "weather")?.detail ?? "Weather").split(", adjusted")[0]}, plus season and shelf life` },
    { top: x(kitchen), mid: "Your kitchen", sub: "Learned from every close-out" },
  ];
  return (
    <div className="flex h-full flex-col justify-between">
      <Line sub={`Real numbers: ${item.ingredient.name}, ${day} at Marco's. Plain arithmetic, no chatbot.`}>How one forecast is built.</Line>
      <div className="flex items-stretch gap-5">
        {steps.map((s, i) => (
          <motion.div key={s.mid} className="flex items-center gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.35, duration: 0.45, ease }}>
            {i > 0 && <span className="font-display text-[56px] font-700 text-text-muted">×</span>}
            <div className="w-[290px] self-stretch rounded-2xl border border-border bg-surface p-7">
              <p className="whitespace-nowrap font-display text-[52px] font-800 leading-none tabular-nums text-text-primary">{s.top}</p>
              <p className="mt-4 text-[26px] font-600 text-text-primary">{s.mid}</p>
              <p className="mt-2 text-[19px] leading-snug text-text-muted">{s.sub}</p>
            </div>
          </motion.div>
        ))}
        <motion.div className="flex items-center gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.45, ease }}>
          <span className="font-display text-[56px] font-700 text-text-muted">=</span>
          <div className="w-[300px] self-stretch rounded-2xl border-2 border-waste/60 bg-waste/10 p-7">
            <p className="whitespace-nowrap font-display text-[56px] font-800 leading-none tabular-nums text-waste">{item.predictedWasteKg.toFixed(2)} kg</p>
            <p className="mt-4 text-[26px] font-600 text-text-primary">likely binned</p>
            <p className="mt-2 text-[19px] text-text-muted">
              80% range {item.lowKg?.toFixed(2)}–{item.highKg?.toFixed(2)} kg
            </p>
          </div>
        </motion.div>
      </div>
      <motion.p className="text-[30px] text-text-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
        So prep <span className="font-700 text-good">{item.cutKg.toFixed(2)} kg less</span>: {Math.round(REDUCTION_RATE * 100)}% of the forecast, with the rest kept as a buffer.
      </motion.p>
    </div>
  );
};

type B = (typeof bench.byRestaurant)["marcos-trattoria"];
const KITCHENS: { id: keyof typeof bench.byRestaurant; name: string; kind: string; icon: typeof Salad }[] = [
  { id: "marcos-trattoria", name: "Marco's Trattoria", kind: "Italian dinner, busiest Saturday", icon: UtensilsCrossed },
  { id: "golden-crumb", name: "Golden Crumb Café", kind: "Bakery, sells out by 2pm", icon: Croissant },
  { id: "kendall-bowls", name: "Kendall Bowl Co.", kind: "Office lunch, closed Sunday", icon: Salad },
];
const LO = 0.5;
const pos = (a: number) => `${((a - LO) / (1 - LO)) * 100}%`;

// Same code, three kitchens with different hidden habits. Owner = prep to the
// last 4 same weekdays; oracle = knows the simulator's hidden parameters.
export const S7Kitchens = () => {
  const all = bench.byRestaurant as Record<string, B>;
  return (
    <div className="flex h-full flex-col justify-between">
      <Line sub="Same code. Each kitchen has habits the model is never told. It learns them from the nightly close-out.">Works for any kind of kitchen.</Line>
      <div className="space-y-9">
        <div className="ml-[420px] flex gap-8 text-[20px] text-text-muted">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-waste" /> Rule of thumb</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-text-secondary" /> Owner&apos;s best guess</span>
          <span className="flex items-center gap-2"><i className="h-3 w-6 rounded-sm bg-good" /> FreshCast</span>
          <span className="flex items-center gap-2"><i className="h-5 w-0.5 bg-data" /> Oracle (best possible)</span>
        </div>
        {KITCHENS.map((k, i) => {
          const b = all[k.id];
          const v0 = b.versions[0].accuracy;
          const v4 = b.versions[b.versions.length - 1].accuracy;
          const fewer = Math.round((1 - (1 - v4) / (1 - b.owner)) * 100);
          return (
            <div key={k.id} className="flex items-center gap-10">
              <div className="flex w-[380px] shrink-0 items-center gap-4">
                <k.icon className="h-10 w-10 shrink-0 text-good" strokeWidth={1.75} />
                <div>
                  <p className="font-display text-[28px] font-700 leading-tight text-text-primary">{k.name}</p>
                  <p className="text-[19px] text-text-muted">{k.kind}</p>
                </div>
              </div>
              <div className="relative h-12 flex-1 rounded-lg bg-surface">
                <motion.div className="absolute inset-y-0 left-0 origin-left rounded-lg bg-good/85" style={{ width: pos(v4) }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 + i * 0.25, duration: 0.8, ease }} />
                <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas bg-waste" style={{ left: pos(v0) }} />
                <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-canvas bg-text-secondary" style={{ left: pos(b.owner) }} />
                <span className="absolute -inset-y-2 w-0.5 bg-data" style={{ left: pos(b.ceiling) }} />
              </div>
              <div className="w-[230px] shrink-0 text-right">
                <p className="font-display text-[40px] font-800 leading-none tabular-nums text-good">{(v4 * 100).toFixed(1)}%</p>
                <p className="mt-2 text-[18px] leading-snug text-text-muted">{fewer}% fewer misses<br />than the owner</p>
              </div>
            </div>
          );
        })}
        <div className="relative ml-[420px] mr-[270px] h-6 text-[18px] tabular-nums text-text-muted">
          <span className="absolute left-0">50%</span>
          <span className="absolute left-1/2 -translate-x-1/2">75%</span>
          <span className="absolute right-0">100% accurate</span>
        </div>
      </div>
      <Source>Simulated kitchens: 12 weeks, 5 seeds each, scored walk-forward. Accuracy = 1 − weighted absolute error. Real-world accuracy needs a real kitchen.</Source>
    </div>
  );
};

export const S13Roadmap = () => {
  const cols: [string, string, string[]][] = [
    ["Live now", "text-good", ["Forecast + prep list for any restaurant", "Two-tap logging, English and Español", "Setup from an OpenStreetMap search", "Accuracy page that shows its own misses"]],
    ["Next", "text-data", ["Run it in one real kitchen", "Measure real accuracy against a scale", "Sold-out button for the close-out"]],
    ["After that", "text-text-secondary", ["Guest counts straight from the POS", "Order list sent to the supplier", "Multi-location groups"]],
  ];
  return (
    <div className="flex h-full flex-col">
      <Line>Roadmap.</Line>
      <div className="grid flex-1 grid-cols-3 content-center gap-8">
        {cols.map(([h, tone, items], i) => (
          <motion.div key={h} className="rounded-2xl border border-border bg-surface p-9" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.2, duration: 0.45, ease }}>
            <p className={`font-display text-[34px] font-700 ${tone}`}>{h}</p>
            <ul className="mt-6 space-y-4 text-[26px] leading-snug text-text-secondary">
              {items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
