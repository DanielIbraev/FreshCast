import { Card } from "@/components/ui/card";
import { ItemRecord, ItemStatus } from "@/lib/track-record";
import { cn } from "@/lib/utils";
import { pct, usd } from "./format";

const STATUS: Record<ItemStatus, { label: string; cls: string }> = {
  "on-target": { label: "On target", cls: "border-good/40 bg-good/10 text-good" },
  learning: { label: "Learning", cls: "border-border bg-canvas text-text-muted" },
  over: { label: "Over-forecasting", cls: "border-caution/40 bg-caution/10 text-caution" },
  under: { label: "Under-forecasting", cls: "border-caution/40 bg-caution/10 text-caution" },
};

function biasText(b: number | null) {
  if (b === null) return "–";
  const n = Math.round(Math.abs(b) * 100);
  if (n < 2) return "Within 2%";
  return `Forecast ${n}% ${b > 0 ? "high" : "low"}`;
}

function headlineFor(items: ItemRecord[]) {
  const top = items[0];
  const flagged = items.filter((i) => i.status === "over" || i.status === "under");
  const learning = items.filter((i) => i.status === "learning");
  const lead = top && top.wasteCostLast28 > 0 ? `${top.name} cost the most: ${usd(top.wasteCostLast28)} in the bin over 4 weeks. ` : "";
  if (flagged.length) return `${lead}${flagged.length} of ${items.length} items are off by more than 15%`;
  if (learning.length === items.length) return `${lead}Every item is still learning (fewer than 10 scored nights)`;
  if (learning.length) return `${lead}${items.length - learning.length} items on target, ${learning.length} still learning`;
  return `${lead}All ${items.length} items are within 15% on average`;
}

const th = "px-3 py-2.5 text-left text-[11px] font-500 uppercase tracking-wider text-text-muted";
const td = "px-3 py-3 tabular-nums";

export function ItemTable({ items }: { items: ItemRecord[] }) {
  const rows = [...items].sort((a, b) => b.wasteCostLast28 - a.wasteCostLast28);
  return (
    <Card className="p-0">
      <div className="px-6 pb-4 pt-6">
        <h2 className="font-display text-lg font-600 text-text-primary">{headlineFor(rows)}</h2>
        <p className="mt-0.5 text-sm text-text-secondary">Each item scored on its own close-outs over the last 4 weeks. Sorted by what actually went in the bin.</p>
      </div>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-canvas/60">
            <tr>
              <th scope="col" className={cn(th, "pl-6")}>Item</th>
              <th scope="col" className={cn(th, "text-right")}>Nights logged</th>
              <th scope="col" className={cn(th, "text-right")}>Accuracy (4 wk)</th>
              <th scope="col" className={th}>Bias</th>
              <th scope="col" className={cn(th, "text-right")}>In range</th>
              <th scope="col" className={cn(th, "text-right")}>Sold-out nights</th>
              <th scope="col" className={cn(th, "text-right")}>Waste, last 4 wks</th>
              <th scope="col" className={cn(th, "pr-6")}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((i) => {
              const s = STATUS[i.status];
              const bigBias = i.bias !== null && Math.abs(i.bias) > 0.15;
              return (
                <tr key={i.id} className="transition-colors duration-150 hover:bg-surface-hover">
                  <th scope="row" className="py-3 pl-6 pr-3 text-left font-500 text-text-primary">{i.name}</th>
                  <td className={cn(td, "text-right text-text-secondary")}>{i.nights}</td>
                  <td className={cn(td, "text-right font-600 text-text-primary")}>{pct(i.accuracy, 1)}</td>
                  <td className={cn(td, bigBias ? "text-caution" : "text-text-secondary")}>{biasText(i.bias)}</td>
                  <td className={cn(td, "text-right text-text-secondary")}>{pct(i.rangeHit)}</td>
                  <td className={cn(td, "text-right", i.soldOut >= 3 ? "text-caution" : "text-text-secondary")}>{i.soldOut}</td>
                  <td className={cn(td, "text-right font-600 text-text-primary")}>{usd(i.wasteCostLast28)}</td>
                  <td className="py-3 pl-3 pr-6">
                    <span className={cn("inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-500", s.cls)}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
