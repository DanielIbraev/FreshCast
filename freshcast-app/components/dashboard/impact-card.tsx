"use client";

import { Car, Leaf, Scale, Utensils } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { Summary } from "@/lib/history";

// Climate impact of following the prep plan, from the last 30 days of close-outs.
// 1 meal = 1.2 lb of food (Feeding America). ~0.4 kg CO2 per mile for a
// typical passenger car (EPA). CO2e = farm-to-retail emissions of the food
// the plan didn't buy (Poore & Nemecek 2018 via Our World in Data); landfill
// methane would add more, so these are conservative.
const LB_PER_KG = 2.2046;

export function ImpactCard({ sum }: { sum: Summary }) {
  const meals = (sum.kgLast30 * LB_PER_KG) / 1.2;
  const miles = sum.co2Last30 / 0.4;
  const items = [
    { icon: Utensils, value: meals, suffix: "", label: "meals' worth of food not bought and binned" },
    { icon: Scale, value: sum.kgLast30, suffix: " kg", label: "less food bought and binned" },
    { icon: Leaf, value: sum.co2Last30, suffix: "", label: "kg CO₂e embodied in food not bought" },
    { icon: Car, value: miles, suffix: "", label: "miles of car driving, equivalent" },
  ];

  return (
    <Card className="border-good/30">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardLabel>Climate impact, last 30 days</CardLabel>
        <span className="text-xs text-text-muted">From your nightly close-outs. Only nights where the plan's cut is provable. Sources: Feeding America, EPA, Our World in Data.</span>
      </div>
      {sum.daysLogged === 0 ? (
        <p className="mt-4 text-sm text-text-muted">Close out a few nights and your impact shows up here.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map(({ icon: Icon, value, suffix, label }) => (
            <div key={label}>
              <Icon className="h-5 w-5 text-good" strokeWidth={2} />
              <p className="mt-2 font-display text-[32px] font-700 leading-none tabular-nums text-text-primary">
                <Counter value={Math.round(value)} suffix={suffix} />
              </p>
              <p className="mt-1.5 text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
