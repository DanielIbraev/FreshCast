import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  ClipboardList,
  CloudRain,
  LucideIcon,
  PackageX,
  Scale,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Action } from "@/lib/track-record";

const KIND: Record<Action["kind"], { icon: LucideIcon; tone: string; label?: string }> = {
  "log-more": { icon: ClipboardList, tone: "text-data", label: "Log tonight" },
  weakest: { icon: Target, tone: "text-caution", label: "Adjust prep" },
  bias: { icon: Scale, tone: "text-caution", label: "Open Kitchen" },
  "sold-out": { icon: PackageX, tone: "text-caution", label: "Adjust prep" },
  weekday: { icon: CalendarDays, tone: "text-caution" },
  weather: { icon: CloudRain, tone: "text-caution" },
  guests: { icon: Users, tone: "text-data", label: "Import sales" },
  improved: { icon: TrendingUp, tone: "text-good" },
  "keep-going": { icon: CircleCheck, tone: "text-good" },
};

function linkFor(a: Action) {
  if (!a.link) return null;
  if (a.link === "log") return { href: "/log", label: "Log tonight" };
  return { href: "/kitchen", label: KIND[a.kind].label ?? "Open Kitchen" };
}

export function Actions({ actions }: { actions: Action[] }) {
  return (
    <Card>
      <h2 className="font-display text-lg font-600 text-text-primary">What would improve accuracy</h2>
      <p className="mt-0.5 text-sm text-text-secondary">Found in this kitchen&apos;s own close-outs, most useful first.</p>
      <ul className="mt-4 divide-y divide-border">
        {actions.map((a, i) => {
          const k = KIND[a.kind];
          const Icon = k.icon;
          const link = linkFor(a);
          return (
            <li key={`${a.kind}-${a.itemId ?? i}`} className="flex items-start gap-3 py-3 last:pb-0">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${a.ok ? "text-good" : k.tone}`} aria-hidden />
              <p className="flex-1 text-[13px] leading-relaxed text-text-secondary">
                {a.lead && <span className="font-600 text-text-primary">{a.lead} </span>}
                {a.text}
              </p>
              {link && (
                <Link
                  href={link.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-600 text-text-primary transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-data"
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
