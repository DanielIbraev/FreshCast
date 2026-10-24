import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardLabel } from "@/components/ui/card";
import { TrackRecord } from "@/lib/track-record";
import { cn } from "@/lib/utils";
import { Bench, lastNights, pct, usd, v4Of } from "./format";

function rangeVerdict(hit: number) {
  if (hit < 0.7) return { word: "Too narrow", text: "Real nights fall outside the range more often than the 80% it promises.", tone: "text-caution" };
  if (hit > 0.9) return { word: "Wider than needed", text: "The range could be tighter and still hold 80% of nights.", tone: "text-caution" };
  return { word: "Calibrated", text: "Target is 80%. The range is about as wide as it needs to be.", tone: "text-good" };
}

export function Kpis({ tr, bench }: { tr: TrackRecord; bench: Bench | null }) {
  const n = lastNights(tr);
  const delta = tr.lastFourWeeks !== null && tr.firstTwoWeeks !== null ? (tr.lastFourWeeks - tr.firstTwoWeeks) * 100 : null;
  const verdict = tr.rangeHit !== null ? rangeVerdict(tr.rangeHit) : null;
  const owner = bench?.owner ?? null;
  const v4 = bench ? v4Of(bench) : null;
  const fewer = owner !== null && v4 !== null ? Math.round((1 - (1 - v4) / (1 - owner)) * 100) : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <Card className="sm:col-span-2 xl:col-span-1">
        <CardLabel>Accuracy, last 4 weeks</CardLabel>
        <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="font-display text-[52px] font-700 leading-none tracking-tight tabular-nums text-text-primary">{pct(tr.lastFourWeeks, 1)}</p>
          {delta !== null && (
            <span className={cn("mb-1 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-600 tabular-nums", delta >= 0 ? "border-good/40 text-good" : "border-caution/40 text-caution")}>
              {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} pts vs first 2 weeks ({pct(tr.firstTwoWeeks, 1)})
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          {tr.lastFourWeeks === null ? (
            `Needs 14 open nights to score a 4-week window. ${tr.openNights} logged so far.`
          ) : (
            <>
              Typical night off by <span className="tabular-nums text-text-primary">{usd(n.avgMiss)}</span> on about{" "}
              <span className="tabular-nums text-text-primary">{usd(n.avgActual)}</span> of waste.
            </>
          )}
        </p>
      </Card>

      <Card>
        <CardLabel>Inside the 80% range</CardLabel>
        <p className="mt-2 font-display text-[36px] font-700 leading-none tabular-nums text-text-primary">{pct(tr.rangeHit)}</p>
        {verdict && <p className={cn("mt-2 text-xs font-600", verdict.tone)}>{verdict.word}</p>}
        <p className="mt-1 text-xs leading-relaxed text-text-muted">{verdict?.text ?? "Scored once items have a few nights each."}</p>
      </Card>

      {fewer !== null && owner !== null && v4 !== null ? (
        <Card>
          <CardLabel>Vs. the owner&apos;s method</CardLabel>
          <p className="mt-2 font-display text-[36px] font-700 leading-none tabular-nums text-good">{fewer}%</p>
          <p className="mt-2 text-xs font-600 text-text-secondary">fewer misses</p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            than prepping to a 4-week same-weekday average. Benchmark: {pct(owner, 1)} vs {pct(v4, 1)}.
          </p>
        </Card>
      ) : (
        <Card>
          <CardLabel>Open nights logged</CardLabel>
          <p className="mt-2 font-display text-[36px] font-700 leading-none tabular-nums text-text-primary">{tr.openNights}</p>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">Scoring starts after night 3. Ranges tighten as each item builds history.</p>
        </Card>
      )}

      <Card>
        <CardLabel>Sell-outs not scored</CardLabel>
        <p className="mt-2 font-display text-[36px] font-700 leading-none tabular-nums text-text-primary">{tr.soldOutNights}</p>
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          Item-nights that logged zero after a prep cut. The item may have run out, so true waste is unknown and the night is left out.
        </p>
      </Card>
    </div>
  );
}
