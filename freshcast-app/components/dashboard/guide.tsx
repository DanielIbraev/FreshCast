"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "freshcast:guide-done";

export interface GuideState {
  pickedDay: boolean;
  openedItem: boolean;
  triedWhatIf: boolean;
  applied: boolean;
}

const STEPS: { key: keyof GuideState; text: string }[] = [
  { key: "pickedDay", text: "Pick a day in the week" },
  { key: "openedItem", text: "Click an ingredient to see its math" },
  { key: "triedWhatIf", text: "Try a what-if: fewer guests or rain" },
  { key: "applied", text: "Apply the prep plan" },
];

// First-visit walkthrough. Each step ticks itself off as the visitor does it;
// it can be closed at any time and stays closed on this device.
export function Guide({ state }: { state: GuideState }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => setHidden(localStorage.getItem(KEY) === "1"), []);
  if (hidden) return null;

  const done = STEPS.filter((s) => state[s.key]).length;
  const all = done === STEPS.length;
  const close = () => {
    localStorage.setItem(KEY, "1");
    setHidden(true);
  };

  return (
    <section aria-label="Try FreshCast in four steps" className="flex items-start gap-3 rounded-lg border border-good/40 bg-surface py-3 pl-4 pr-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2 py-1.5">
        <p className="text-sm font-600 text-text-primary">{all ? "That's the morning loop." : `New here? Four clicks, ${done} done.`}</p>
        {all ? (
          <Link href="/log" className="inline-flex items-center gap-1.5 text-sm font-600 text-good hover:text-text-primary">
            Now close out tonight on Log waste and watch it learn <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <ol className="flex flex-wrap gap-x-5 gap-y-1.5">
            {STEPS.map((s, i) => {
              const ok = state[s.key];
              return (
                <li key={s.key} className={cn("flex items-center gap-2 text-sm", ok ? "text-text-muted line-through" : "text-text-secondary")}>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-xs tabular-nums", ok ? "border-good bg-good text-canvas" : "border-border text-text-secondary")} aria-hidden>
                    {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </span>
                  {s.text}
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <button onClick={close} aria-label="Close the walkthrough" className="shrink-0 rounded-md p-2 text-text-muted transition-colors duration-150 hover:text-text-primary">
        <X className="h-4 w-4" />
      </button>
    </section>
  );
}
