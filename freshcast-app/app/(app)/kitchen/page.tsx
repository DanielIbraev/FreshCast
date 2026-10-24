"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { CategoryDonut } from "@/components/charts/category-donut";
import { IngredientForm } from "@/components/kitchen/ingredient-form";
import { IngredientTable } from "@/components/kitchen/ingredient-table";
import { useStore } from "@/lib/store";
import { Category, Ingredient } from "@/lib/types";
import { STAPLES, CUISINE_LABELS, toIngredient } from "@/lib/staples";
import { GuestPattern } from "@/components/guest-pattern";
import { saveProfile } from "@/lib/profile";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { cn, formatCurrency } from "@/lib/utils";

export default function KitchenPage() {
  const { ingredients, observations, addIngredient, updateIngredient, removeIngredient, profile } = useStore();
  const daysByIngredient = useMemo(() => {
    const m = new Map<string, Set<string>>();
    observations.forEach((o) => (m.get(o.ingredientId) ?? m.set(o.ingredientId, new Set()).get(o.ingredientId)!).add(o.date));
    return m;
  }, [observations]);
  const daysOf = (id: string) => daysByIngredient.get(id)?.size ?? 0;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [editing, setEditing] = useState<Ingredient | null | "new">(null);

  const visible = useMemo(
    () =>
      ingredients
        .filter((i) => (filter === "all" ? true : i.category === filter))
        .filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => b.costPerKg * b.baselinePrepKg - a.costPerKg * a.baselinePrepKg),
    [ingredients, filter, query]
  );

  const prepValue = ingredients.reduce((s, i) => s + i.costPerKg * i.baselinePrepKg, 0);
  const perishable = ingredients.filter((i) => i.shelfLifeDays <= 2);
  const learning = ingredients.filter((i) => daysOf(i.id) < 14).length;
  const names = new Set(ingredients.map((i) => i.name.toLowerCase()));
  const staples = STAPLES[profile.cuisineType].filter((s) => !names.has(s.name.toLowerCase()));

  function quickAdd(s: (typeof staples)[number]) {
    addIngredient(toIngredient(s));
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">Set up once. FreshCast forecasts every item here.</p>
          <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Kitchen</h1>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim">
          <Plus className="h-4 w-4" /> Add ingredient
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <Card className="flex flex-col">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <CardLabel>Prepped every morning</CardLabel>
              <p className="mt-2 font-display text-[40px] font-700 leading-none tabular-nums text-text-primary">{formatCurrency(prepValue)}</p>
              <p className="mt-2 text-xs text-text-muted">across {ingredients.length} ingredients</p>
            </div>
            <div>
              <CardLabel>Use within 2 days</CardLabel>
              <p className="mt-2 font-display text-[40px] font-700 leading-none tabular-nums text-waste">{perishable.length}</p>
              <p className="mt-2 text-xs text-text-muted">{learning > 0 ? `${learning} still learning from your logs` : "All items calibrated"}</p>
            </div>
          </div>
          {perishable.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border pt-4">
              {perishable.map((p) => (
                <span key={p.id} className="flex items-center gap-1.5 rounded border border-border bg-canvas px-2 py-0.5 text-xs text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORIES[p.category].color }} />
                  {p.name}
                  <span className="text-waste">{p.shelfLifeDays}d</span>
                </span>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <CardLabel>Where the prep money goes</CardLabel>
          <div className="mt-4">
            <CategoryDonut ingredients={ingredients} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardLabel>Guests by weekday</CardLabel>
          <span className="text-xs text-text-muted">Drives the guest signal in every forecast</span>
        </div>
        <div className="mt-4 max-w-xl">
          <GuestPattern
            coversByDay={profile.coversByDay}
            source={profile.coversSource}
            onImport={(r) => {
              // Reload so every forecast and the learning layer use the new pattern.
              saveProfile({ ...profile, coversByDay: r.coversByDay, avgCovers: r.avgCovers, coversSource: "pos-import" });
              setTimeout(() => window.location.reload(), 1200);
            }}
          />
        </div>
      </Card>

      {staples.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Common for {CUISINE_LABELS[profile.cuisineType].toLowerCase()} kitchens:</span>
          {staples.map((s) => (
            <button
              key={s.name}
              onClick={() => quickAdd(s)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-2 text-xs text-text-secondary transition-colors duration-150 hover:border-good hover:text-text-primary"
            >
              <Plus className="h-3 w-3" /> {s.name}
            </button>
          ))}
        </div>
      )}

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ingredients"
              aria-label="Search ingredients"
              className="w-full rounded-md border border-[#66768C] bg-canvas py-2 pl-9 pr-3 text-sm text-text-primary focus:border-good focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-1">
            {(["all", ...CATEGORY_ORDER] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-md px-2.5 py-2 text-xs transition-colors duration-150",
                  filter === c ? "bg-surface-hover font-600 text-text-primary" : "text-text-muted hover:text-text-secondary"
                )}
              >
                {c === "all" ? "All" : CATEGORIES[c].label}
              </button>
            ))}
          </div>
        </div>
        <IngredientTable items={visible} onEdit={setEditing} onDelete={(i) => removeIngredient(i.id)} daysOf={daysOf} />
      </Card>

      {editing && (
        <IngredientForm
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(i) => {
            if (editing === "new") addIngredient(i);
            else updateIngredient(i);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
