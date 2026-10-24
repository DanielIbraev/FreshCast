import Link from "next/link";
import { ClipboardPen } from "lucide-react";
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

export function ModelEmpty({ nights }: { nights: number }) {
  const left = Math.max(1, 4 - nights);
  return (
    <Card className="flex flex-col items-start gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <h2 className="font-display text-lg font-600 text-text-primary">
          Close out {left} more {left === 1 ? "night" : "nights"} on the Log screen and this page starts scoring the forecast
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {nights === 0 ? "No close-outs yet." : `${nights} ${nights === 1 ? "night" : "nights"} logged so far.`} The first 3 nights set a baseline. From night 4,
          every close-out is compared with the forecast the kitchen saw that morning.
        </p>
      </div>
      <Link
        href="/log"
        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-good px-4 py-2 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-good"
      >
        <ClipboardPen className="h-4 w-4" aria-hidden />
        Go to Log
      </Link>
    </Card>
  );
}
