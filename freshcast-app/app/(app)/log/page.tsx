"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Leaf, Check } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { DEMO_INGREDIENTS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

interface LoggedItem {
  id: string;
  name: string;
  quantityKg: number;
  cost: number;
  co2: number;
  time: string;
}

export default function LogWastePage() {
  const [logged, setLogged] = useState<LoggedItem[]>([]);
  const [selectedId, setSelectedId] = useState(DEMO_INGREDIENTS[0].id);
  const [qty, setQty] = useState("0.5");

  const totalCo2 = logged.reduce((s, l) => s + l.co2, 0);
  const totalCost = logged.reduce((s, l) => s + l.cost, 0);

  function logWaste() {
    const ing = DEMO_INGREDIENTS.find((i) => i.id === selectedId)!;
    const quantityKg = parseFloat(qty) || 0;
    if (quantityKg <= 0) return;
    const item: LoggedItem = {
      id: `${Date.now()}`,
      name: ing.name,
      quantityKg,
      cost: quantityKg * ing.costPerKg,
      co2: quantityKg * ing.co2PerKg,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLogged((prev) => [item, ...prev]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-text-primary">
          Log Waste
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Two taps during service. This is the only daily input FreshCast needs.
        </p>
      </div>

      {/* Live CO2 counter — the signature live number */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardLabel>CO₂ logged today</CardLabel>
          <p className="mt-2 font-display text-5xl font-800 tracking-tight tabular-nums text-waste">
            <Counter value={totalCo2} suffix="kg" decimals={1} />
          </p>
        </Card>
        <Card>
          <CardLabel>Cost wasted today</CardLabel>
          <p className="mt-2 font-display text-5xl font-800 tracking-tight tabular-nums text-waste">
            <Counter value={totalCost} prefix="$" decimals={2} />
          </p>
        </Card>
      </div>

      {/* Log form */}
      <Card>
        <h2 className="mb-4 font-display text-lg font-600 text-text-primary">
          Add a waste item
        </h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs text-text-muted">
              Ingredient
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-text-primary focus:border-good focus:outline-none"
            >
              {DEMO_INGREDIENTS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="mb-1.5 block text-xs text-text-muted">
              Amount (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-text-primary focus:border-good focus:outline-none"
            />
          </div>
          <button
            onClick={logWaste}
            className="flex items-center gap-2 rounded-md bg-good px-4 py-2 text-sm font-500 text-canvas transition-colors duration-150 hover:bg-good-dim"
          >
            <Plus className="h-4 w-4" />
            Log it
          </button>
        </div>
      </Card>

      {/* Logged list */}
      <Card>
        <h2 className="mb-4 font-display text-lg font-600 text-text-primary">
          Today&apos;s log
        </h2>
        {logged.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Leaf className="h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">
              Nothing logged yet. Add an item above to see it appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {logged.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-between rounded-md border border-border bg-canvas px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface">
                      <Check className="h-4 w-4 text-good" />
                    </div>
                    <div>
                      <p className="text-sm font-500 text-text-primary">
                        {item.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {item.quantityKg}kg · {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-500 tabular-nums text-waste">
                      {formatCurrency(item.cost)}
                    </p>
                    <p className="text-xs text-text-muted tabular-nums">
                      {item.co2.toFixed(1)}kg CO₂
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  );
}
