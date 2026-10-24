import { cn } from "@/lib/utils";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-5 text-sm font-600 uppercase tracking-[0.18em] text-good">{children}</p>;
}

export function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("font-display text-[56px] font-700 leading-[1.05] tracking-tight text-text-primary", className)}>{children}</h2>;
}

export function Stat({ value, label, tone = "primary", source }: { value: string; label: string; tone?: "waste" | "good" | "primary"; source?: string }) {
  const color = tone === "waste" ? "text-waste" : tone === "good" ? "text-good" : "text-text-primary";
  return (
    <div>
      <p className={cn("font-display text-[64px] font-800 leading-none tracking-tight tabular-nums", color)}>{value}</p>
      <p className="mt-3 max-w-[260px] text-lg leading-snug text-text-secondary">{label}</p>
      {source && <p className="mt-2 text-xs text-text-muted">{source}</p>}
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-border bg-surface p-7", className)}>{children}</div>;
}
