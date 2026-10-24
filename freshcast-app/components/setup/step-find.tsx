"use client";

import { useRef } from "react";
import { PencilLine, Search, SearchX, WifiOff } from "lucide-react";
import { PlaceResult } from "./draft";
import { Field, inputCls } from "./fields";
import { PlaceCard, PlaceSkeleton } from "./place-card";

export interface SearchState {
  q: string;
  near: string;
  status: "idle" | "loading" | "done" | "empty" | "error";
  results: PlaceResult[];
  message?: string;
}

export const emptySearch: SearchState = { q: "", near: "", status: "idle", results: [] };

// Nominatim allows 1 request per second, so search runs on submit only and
// waits out the gap if someone presses Enter twice quickly.
export function StepFind({ search, setSearch, onPick, onManual }: { search: SearchState; setSearch: (fn: (s: SearchState) => SearchState) => void; onPick: (p: PlaceResult) => void; onManual: () => void }) {
  const last = useRef(0);
  const tooShort = search.q.trim().length < 2;

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || search.status === "loading") return;
    setSearch((s) => ({ ...s, status: "loading", message: undefined }));
    const gap = last.current + 1100 - Date.now();
    if (gap > 0) await new Promise((r) => setTimeout(r, gap));
    last.current = Date.now();
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(search.q.trim())}&near=${encodeURIComponent(search.near.trim())}`);
      const data = (await res.json().catch(() => ({}))) as { results?: PlaceResult[]; error?: string };
      if (res.ok && data.results?.length) setSearch((s) => ({ ...s, status: "done", results: data.results! }));
      else if (res.status === 404) setSearch((s) => ({ ...s, status: "empty", results: [], message: data.error }));
      else setSearch((s) => ({ ...s, status: "error", results: [], message: data.error }));
    } catch {
      setSearch((s) => ({ ...s, status: "error", results: [], message: undefined }));
    }
  }

  return (
    <div className="space-y-5">
      <p className="max-w-prose text-sm text-text-secondary">
        Search OpenStreetMap and we&apos;ll fill in your address, cuisine and opening hours. You can change anything on the next screens.
      </p>

      <form onSubmit={run} className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-end" role="search">
        <Field label="Restaurant name" htmlFor="find-q">
          <input id="find-q" className={inputCls} value={search.q} maxLength={100} autoComplete="off" placeholder="e.g. Neptune Oyster" onChange={(e) => setSearch((s) => ({ ...s, q: e.target.value }))} />
        </Field>
        <Field label="City or ZIP" htmlFor="find-near">
          <input id="find-near" className={inputCls} value={search.near} maxLength={100} autoComplete="postal-code" placeholder="e.g. Boston or 02113" onChange={(e) => setSearch((s) => ({ ...s, near: e.target.value }))} />
        </Field>
        <button
          type="submit"
          disabled={tooShort || search.status === "loading"}
          className="flex h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-good px-4 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-4 w-4" aria-hidden /> Search
        </button>
      </form>

      <div aria-live="polite" aria-busy={search.status === "loading"}>
        {search.status === "loading" && (
          <ul className="space-y-2" aria-label="Searching">
            <PlaceSkeleton />
            <PlaceSkeleton />
            <PlaceSkeleton />
          </ul>
        )}
        {search.status === "done" && (
          <>
            <p className="mb-2 text-xs text-text-muted">
              {search.results.length === 1 ? "1 match" : `${search.results.length} matches`}. Pick yours.
            </p>
            <ul className="space-y-2">
              {search.results.map((p) => (
                <PlaceCard key={p.osmId} p={p} onPick={() => onPick(p)} />
              ))}
            </ul>
          </>
        )}
        {(search.status === "empty" || search.status === "error") && (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-canvas p-4">
            {search.status === "empty" ? <SearchX className="mt-0.5 h-4 w-4 shrink-0 text-caution" aria-hidden /> : <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-waste" aria-hidden />}
            <div className="text-sm">
              <p className="text-text-primary">{search.status === "empty" ? "Nothing matched." : "Search isn't working right now."}</p>
              <p className="mt-0.5 text-xs text-text-muted">{search.message ?? "Check your connection and try again, or enter your details by hand."}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hallmark 39b: card-sized on purpose, it matches the result cards above. */}
      <button
        type="button"
        onClick={onManual}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 text-left transition-colors duration-150 hover:border-good focus-visible:border-good focus-visible:outline-none"
      >
        <PencilLine className="h-4 w-4 shrink-0 text-good" aria-hidden />
        <span className="text-sm">
          <span className="block font-600 text-text-primary">My restaurant isn&apos;t listed</span>
          <span className="block text-xs text-text-muted">Enter the details by hand. Takes about two minutes.</span>
        </span>
      </button>
    </div>
  );
}
