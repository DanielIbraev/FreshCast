import Link from "next/link";
import { Circle, CircleCheck, ClipboardPen } from "lucide-react";
import { Card } from "@/components/ui/card";

const block = "animate-pulse rounded-card bg-surface motion-reduce:animate-none";

export function ModelSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading model accuracy">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-[148px] ${block} ${i === 0 ? "sm:col-span-2 xl:col-span-1" : ""}`} />
        ))}
      </div>
      <div className={`h-[400px] ${block}`} />
      <div className={`h-[330px] ${block}`} />
      <div className={`h-[420px] ${block}`} />
    </div>
  );
}

// What each close-out unlocks. Thresholds match lib/track-record.ts: 3 warm-up
// nights, a 14-night first window and a 28-night rolling window.
const MILESTONES = [
  { at: 3, title: "Scoring starts", text: "The first 3 nights set a baseline. From the next close-out, each night is scored against that morning's forecast." },
  { at: 14, title: "First 2-week accuracy", text: "Enough nights to compare the forecast with what went in the bin, item by item." },
  { at: 28, title: "4-week accuracy and calibrated ranges", text: "A full 4-week window, and 80% ranges sized from this kitchen's own misses." },
];
const GOAL = MILESTONES[MILESTONES.length - 1].at;

export function ModelEmpty({ nights }: { nights: number }) {
  const left = Math.max(1, 4 - nights);
  const share = Math.min(1, nights / GOAL);
  return (
    <Card className="p-0">
      <div className="flex flex-col items-start gap-4 px-6 pb-6 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-xl font-600 leading-snug text-text-primary">
            {nights === 0 ? "Close out tonight and this page starts learning your kitchen" : `${nights} ${nights === 1 ? "night" : "nights"} in. ${left} more and the forecast gets its first score`}
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Log waste and guests served at the end of service. It takes about a minute, and every night makes tomorrow&apos;s forecast fit this kitchen better.
          </p>
        </div>
        <Link
          href="/log"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-good"
        >
          <ClipboardPen className="h-4 w-4" aria-hidden />
          Close out tonight
        </Link>
      </div>
      <div className="px-6 pb-8">
        <div className="flex items-baseline justify-between text-xs text-text-secondary">
          <span id="nights-label">Nights logged</span>
          <span className="tabular-nums text-text-primary">
            {nights} of {GOAL}
          </span>
        </div>
        <div
          role="progressbar"
          aria-labelledby="nights-label"
          aria-valuemin={0}
          aria-valuemax={GOAL}
          aria-valuenow={nights}
          className="relative mt-2 h-2 rounded-full bg-canvas"
        >
          <div className="h-full rounded-full bg-good" style={{ width: `${Math.max(share * 100, nights ? 2 : 0)}%` }} />
          {MILESTONES.map((m) => (
            <span key={m.at} className={`absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 ${nights >= m.at ? "bg-good" : "bg-border"}`} style={{ left: `${(m.at / GOAL) * 100}%` }} aria-hidden />
          ))}
        </div>
      </div>
      <ol className="grid grid-cols-1 border-t border-border md:grid-cols-3 md:divide-x md:divide-border">
        {MILESTONES.map((m) => {
          const done = nights >= m.at;
          return (
            <li key={m.at} className="border-b border-border px-6 py-5 last:border-b-0 md:border-b-0">
              <p className="flex items-center gap-2 text-sm font-600 text-text-primary">
                {done ? <CircleCheck className="h-4 w-4 text-good" aria-hidden /> : <Circle className="h-4 w-4 text-text-muted" aria-hidden />}
                Night {m.at}: {m.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{m.text}</p>
              <p className="mt-2 text-xs tabular-nums text-text-muted">{done ? "Reached" : `${m.at - nights} to go`}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
