"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { GuestPattern } from "@/components/guest-pattern";
import { useStore } from "@/lib/store";
import { CuisineType } from "@/lib/types";
import { CUISINE_LABELS, STAPLES, toIngredient } from "@/lib/staples";
import { CATEGORIES } from "@/lib/categories";
import { Profile, weeklyShape } from "@/lib/profile";
import { cn } from "@/lib/utils";

const input = "w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-text-primary focus:border-good focus:outline-none";
const CUISINES = (Object.keys(CUISINE_LABELS) as CuisineType[]).map((c) => ({ value: c, label: CUISINE_LABELS[c] }));

export default function SetupPage() {
  const { startOwnRestaurant, profile } = useStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loc, setLoc] = useState<{ lat: number; lng: number; place: string } | null>(null);
  const [looking, setLooking] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<CuisineType>("italian");
  const [seats, setSeats] = useState("50");
  const [avg, setAvg] = useState("45");
  const [pattern, setPattern] = useState<{ byDay: number[]; source: "default" | "pos-import" }>({ byDay: weeklyShape(45), source: "default" });
  const [picked, setPicked] = useState<Set<string>>(new Set(STAPLES.italian.map((s) => s.name)));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => setPicked(new Set(STAPLES[cuisine].map((s) => s.name))), [cuisine]);
  useEffect(() => {
    if (pattern.source === "default") setPattern({ byDay: weeklyShape(Math.max(1, Number(avg) || 1)), source: "default" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avg]);

  async function lookup() {
    setLooking(true);
    setLocError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLoc(data);
    } catch (e) {
      setLoc(null);
      setLocError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLooking(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "What's the restaurant called?";
    if (!loc) next.loc = "Find the address so we can pull your local weather.";
    if (!(Number(avg) >= 5 && Number(avg) <= 2000)) next.avg = "Between 5 and 2,000 guests.";
    if (picked.size === 0) next.items = "Pick at least one ingredient. You can add more later.";
    setErrors(next);
    if (Object.keys(next).length || !loc) return;

    const p: Profile = {
      id: `own-${Date.now().toString(36)}`,
      name: name.trim().slice(0, 80),
      address: address.trim().slice(0, 200),
      place: loc.place,
      lat: loc.lat,
      lng: loc.lng,
      cuisineType: cuisine,
      seats: Math.max(1, Math.round(Number(seats) || 0)),
      avgCovers: Math.round(pattern.byDay.reduce((s, x) => s + x, 0) / 7),
      coversByDay: pattern.byDay,
      coversSource: pattern.source,
      isDemo: false,
    };
    startOwnRestaurant(p, STAPLES[cuisine].filter((s) => picked.has(s.name)).map(toIngredient));
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="text-sm text-text-muted">About 2 minutes. Saved on this device only.</p>
        <h1 className="font-display text-[28px] font-700 leading-tight text-text-primary">Set up your restaurant</h1>
        {!profile.isDemo && <p className="mt-1 text-xs text-caution">This replaces {profile.name} on this device.</p>}
      </header>

      <Card className="space-y-5">
        <Step n={1} title="Your restaurant">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
            <Field label="Name" error={errors.name}>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Lucia's Kitchen" />
            </Field>
            <Field label="Seats">
              <input className={input} type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
            </Field>
          </div>
          <Field label="Address (for your local weather)" error={errors.loc ?? locError ?? undefined}>
            <div className="flex gap-2">
              <input
                className={input}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setLoc(null);
                }}
                maxLength={200}
                placeholder="123 Main St, Cambridge, MA"
              />
              <button type="button" onClick={lookup} disabled={address.trim().length < 3 || looking} className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-text-primary hover:border-good disabled:opacity-50">
                {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} Find
              </button>
            </div>
            {loc && (
              <span className="mt-1.5 flex items-center gap-1.5 text-xs text-good">
                <Check className="h-3.5 w-3.5" /> {loc.place} · {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
              </span>
            )}
          </Field>
          <Field label="Cuisine">
            <Select label="Cuisine" value={cuisine} options={CUISINES} onChange={setCuisine} className="w-full sm:w-72" />
          </Field>
        </Step>

        <Step n={2} title="How busy are you?">
          <Field label="Guests on an average night" error={errors.avg}>
            <input className={cn(input, "w-32")} type="number" min={5} value={avg} onChange={(e) => setAvg(e.target.value)} />
          </Field>
          <GuestPattern
            coversByDay={pattern.byDay}
            source={pattern.source}
            onImport={(r) => {
              setPattern({ byDay: r.coversByDay, source: "pos-import" });
              setAvg(String(r.avgCovers));
            }}
          />
        </Step>

        <Step n={3} title="What do you prep?">
          <p className="mb-3 text-xs text-text-muted">Common for {CUISINE_LABELS[cuisine].toLowerCase()} kitchens, with typical prices. Edit amounts later in Kitchen.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STAPLES[cuisine].map((s) => {
              const on = picked.has(s.name);
              return (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => setPicked((p) => (p.has(s.name) ? new Set(Array.from(p).filter((x) => x !== s.name)) : new Set(p).add(s.name)))}
                  className={cn("flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150", on ? "border-good bg-surface-hover text-text-primary" : "border-border text-text-muted")}
                  aria-pressed={on}
                >
                  <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-good bg-good" : "border-border")}>{on && <Check className="h-3 w-3 text-canvas" />}</span>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORIES[s.category].color }} />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-[11px] tabular-nums text-text-muted">{s.baselinePrepKg}kg/day</span>
                </button>
              );
            })}
          </div>
          {errors.items && <p className="mt-2 text-xs text-waste">{errors.items}</p>}
        </Step>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-text-muted">Day one runs on industry baselines. It learns your kitchen from your first close-outs.</p>
        <button type="submit" className="shrink-0 rounded-md bg-good px-5 py-2.5 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim">
          See tomorrow&apos;s forecast
        </button>
      </div>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-b border-border pb-5 last:border-0 last:pb-0">
      <h2 className="flex items-center gap-2.5 font-display text-base font-600 text-text-primary">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-canvas text-xs text-good">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs text-text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-waste">{error}</span>}
    </div>
  );
}
