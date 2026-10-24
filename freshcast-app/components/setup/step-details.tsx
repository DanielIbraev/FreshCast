"use client";

import { useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { Select } from "@/components/ui/select";
import { CUISINE_LABELS } from "@/lib/staples";
import { CuisineType, ServiceStyle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AutoField, Draft, Errors, SERVICE_LABELS } from "./draft";
import { DayChips, Field, Segmented, errorCls, inputCls } from "./fields";

const CUISINES = (Object.keys(CUISINE_LABELS) as CuisineType[]).map((c) => ({ value: c, label: CUISINE_LABELS[c] }));
const SERVICES = (Object.keys(SERVICE_LABELS) as ServiceStyle[]).map((s) => ({ value: s, label: SERVICE_LABELS[s] }));

interface Props {
  d: Draft;
  errors: Errors;
  // Editing a field clears its "from OpenStreetMap" chip.
  update: (patch: Partial<Draft>, touched?: AutoField) => void;
  setCuisine: (c: CuisineType) => void;
}

export function StepDetails({ d, errors, update, setCuisine }: Props) {
  const [looking, setLooking] = useState(false);
  const [lookError, setLookError] = useState<string | null>(null);
  const auto = (f: AutoField) => d.auto.includes(f);

  async function find() {
    setLooking(true);
    setLookError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(d.address.trim())}`);
      const data = (await res.json().catch(() => ({}))) as { lat?: number; lng?: number; place?: string; error?: string };
      if (!res.ok || typeof data.lat !== "number" || typeof data.lng !== "number") throw new Error(data.error ?? "Couldn't find that address. Try adding the city.");
      update({ loc: { lat: data.lat, lng: data.lng, place: data.place ?? "", from: "geocode" } });
    } catch (e) {
      update({ loc: null });
      setLookError(e instanceof Error ? e.message : "Address lookup failed.");
    } finally {
      setLooking(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
        <Field label="Restaurant name" htmlFor="d-name" error={errors.name} auto={auto("name")}>
          <input id="d-name" className={cn(inputCls, errors.name && errorCls)} value={d.name} maxLength={80} placeholder="e.g. Lucia's Kitchen" onChange={(e) => update({ name: e.target.value }, "name")} />
        </Field>
        <Field label="Seats" htmlFor="d-seats" error={errors.seats}>
          <input id="d-seats" className={cn(inputCls, "tabular-nums", errors.seats && errorCls)} type="number" inputMode="numeric" min={1} max={2000} value={d.seats} onChange={(e) => update({ seats: e.target.value })} />
        </Field>
      </div>

      <Field label="Address" htmlFor="d-address" hint="Used for your local weather forecast. Nothing else." error={errors.address ?? lookError ?? undefined} auto={auto("address")}>
        <div className="flex gap-2">
          <input
            id="d-address"
            className={cn(inputCls, (errors.address || lookError) && errorCls)}
            value={d.address}
            maxLength={200}
            autoComplete="street-address"
            placeholder="123 Main St, Cambridge, MA"
            onChange={(e) => update({ address: e.target.value, loc: d.loc?.from === "search" ? d.loc : null }, "address")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (d.address.trim().length >= 3) find();
              }
            }}
          />
          <button
            type="button"
            onClick={find}
            disabled={d.address.trim().length < 3 || looking}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm text-text-primary transition-colors duration-150 hover:border-good disabled:cursor-not-allowed disabled:opacity-50"
          >
            {looking ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <MapPin className="h-4 w-4" aria-hidden />} Find
          </button>
        </div>
        {d.loc && (
          <span className="mt-1.5 flex items-center gap-1.5 text-xs text-good">
            <Check className="h-3.5 w-3.5" aria-hidden /> Weather for {d.loc.place || "this spot"} ({d.loc.lat.toFixed(3)}, {d.loc.lng.toFixed(3)})
          </span>
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cuisine" hint="Picks your starter ingredient list and the cuisine signal." auto={auto("cuisine")}>
          <Select label="Cuisine" value={d.cuisineType} options={CUISINES} onChange={setCuisine} className="w-full [&>button]:py-2 [&>button]:text-sm" />
        </Field>
        <Field label="Describe it in your words (optional)" htmlFor="d-label">
          <input id="d-label" className={inputCls} value={d.cuisineLabel} maxLength={60} placeholder="e.g. Neapolitan pizza, Oaxacan" onChange={(e) => update({ cuisineLabel: e.target.value })} />
        </Field>
      </div>

      <Field label="When do you serve?" auto={auto("service")}>
        <Segmented label="Service style" value={d.service} options={SERVICES} onChange={(v) => update({ service: v }, "service")} />
      </Field>

      <Field label="Open days" hint="Tap a day to mark it closed." error={errors.openDays} auto={auto("openDays")}>
        <DayChips value={d.openDays} onChange={(v) => update({ openDays: v }, "openDays")} />
      </Field>
    </div>
  );
}
