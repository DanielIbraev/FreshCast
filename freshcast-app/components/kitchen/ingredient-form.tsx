"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Category, Ingredient } from "@/lib/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  initial?: Ingredient;
  onSave: (i: Ingredient) => void;
  onClose: () => void;
}

const input = "w-full rounded-md border border-[#66768C] bg-canvas px-3 py-2 text-sm text-text-primary focus:border-good focus:outline-none";

export function IngredientForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "produce");
  const [cost, setCost] = useState(String(initial?.costPerKg ?? ""));
  const [prep, setPrep] = useState(String(initial?.baselinePrepKg ?? ""));
  const [shelf, setShelf] = useState(String(initial?.shelfLifeDays ?? "3"));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Give it a name your staff will recognize.";
    if (!(Number(cost) > 0)) next.cost = "Enter what you pay per kg.";
    if (!(Number(prep) > 0)) next.prep = "Enter how much you prep on a normal day.";
    if (!(Number(shelf) >= 1)) next.shelf = "At least 1 day.";
    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({
      id: initial?.id ?? `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
      name: name.trim(),
      category,
      costPerKg: Number(cost),
      baselinePrepKg: Number(prep),
      shelfLifeDays: Math.round(Number(shelf)),
      co2PerKg: initial && initial.category === category ? initial.co2PerKg : CATEGORIES[category].co2PerKg,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <motion.form
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="flex h-full w-full max-w-[420px] flex-col border-l border-border bg-surface"
        aria-label={initial ? "Edit ingredient" : "Add ingredient"}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-600 text-text-primary">{initial ? `Edit ${initial.name}` : "Add an ingredient"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Name" error={errors.name}>
            <input autoFocus className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Burrata" />
          </Field>

          <Field label="Category">
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORY_ORDER.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors duration-150",
                    category === c ? "border-good bg-surface-hover text-text-primary" : "border-border text-text-secondary hover:border-text-muted"
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[c].color }} />
                  {CATEGORIES[c].label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cost per kg ($)" error={errors.cost}>
              <input className={input} type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="18.00" />
            </Field>
            <Field label="Normal daily prep (kg)" error={errors.prep}>
              <input className={input} type="number" step="0.1" min="0" value={prep} onChange={(e) => setPrep(e.target.value)} placeholder="3.0" />
            </Field>
          </div>

          <Field label="Shelf life once prepped (days)" error={errors.shelf}>
            <input className={input} type="number" min="1" value={shelf} onChange={(e) => setShelf(e.target.value)} />
          </Field>

          <div className="rounded-md border border-border bg-canvas px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
            Carbon factor set automatically: <span className="font-600 text-text-primary">{CATEGORIES[category].co2PerKg} kg CO₂ per kg</span> wasted
            (Poore & Nemecek 2018 / Our World in Data, {CATEGORIES[category].label.toLowerCase()} default).
            {!initial && " The model starts on industry baselines and calibrates to your kitchen as you log waste."}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-text-secondary hover:text-text-primary">
            Cancel
          </button>
          <button type="submit" className="rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim">
            {initial ? "Save changes" : "Add to kitchen"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-waste">{error}</span>}
    </label>
  );
}
