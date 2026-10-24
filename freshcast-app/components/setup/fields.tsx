"use client";

import { MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_SHORT } from "./draft";

export const inputCls =
  "w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-good focus:outline-none focus-visible:ring-1 focus-visible:ring-good";
export const errorCls = "border-waste focus:border-waste";

export function AutoChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-data/40 px-1.5 py-px text-xs font-600 text-data">
      <MapPinned className="h-3 w-3" aria-hidden /> Filled in from OpenStreetMap
    </span>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string; // omit for groups (renders a fieldset + legend)
  hint?: string;
  error?: string;
  auto?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, auto, className, children }: FieldProps) {
  const head = (
    <span className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
      {label}
      {auto && <AutoChip />}
    </span>
  );
  const foot = (
    <>
      {hint && !error && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-waste">
          {error}
        </span>
      )}
    </>
  );
  if (!htmlFor) {
    return (
      <fieldset className={className}>
        <legend className="contents">{head}</legend>
        {children}
        {foot}
      </fieldset>
    );
  }
  return (
    <div className={className}>
      <label htmlFor={htmlFor}>{head}</label>
      {children}
      {foot}
    </div>
  );
}

// Rectangular segmented control (radio group semantics).
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1 rounded-md border border-border bg-canvas p-1 sm:inline-grid sm:grid-flow-col sm:auto-cols-fr">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "cursor-pointer rounded px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-good",
              on ? "bg-surface-hover font-600 text-text-primary ring-1 ring-good/60" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function DayChips({ value, onChange }: { value: boolean[]; onChange: (v: boolean[]) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:flex">
      {DAY_SHORT.map((d, i) => {
        const on = value[i];
        return (
          <button
            key={d}
            type="button"
            aria-pressed={on}
            aria-label={`${d}: ${on ? "open" : "closed"}`}
            onClick={() => onChange(value.map((v, j) => (j === i ? !v : v)))}
            className={cn(
              "cursor-pointer rounded-md border px-0 py-1.5 text-xs transition-colors duration-150 sm:w-12 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-good",
              on ? "border-good bg-good/10 font-600 text-text-primary" : "border-border text-text-muted line-through decoration-text-muted/60 hover:text-text-secondary"
            )}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
