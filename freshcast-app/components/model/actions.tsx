import Link from "next/link";
import { ArrowRight, CircleCheck, ClipboardList, LucideIcon, PackageX, Scale, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Action } from "@/lib/track-record";

const KIND: Record<Action["kind"], { icon: LucideIcon; tone: string; link?: { href: string; label: string } }> = {
  "log-more": { icon: ClipboardList, tone: "text-data", link: { href: "/log", label: "Log tonight" } },
  bias: { icon: Scale, tone: "text-caution", link: { href: "/kitchen", label: "Open Kitchen" } },
  "sold-out": { icon: PackageX, tone: "text-caution", link: { href: "/kitchen", label: "Adjust prep" } },
  guests: { icon: Users, tone: "text-data", link: { href: "/kitchen", label: "Import sales" } },
  "keep-going": { icon: CircleCheck, tone: "text-good" },
};

export function Actions({ actions }: { actions: Action[] }) {
  return (
    <Card>
      <h2 className="font-display text-lg font-600 text-text-primary">What would improve accuracy</h2>
      <ul className="mt-4 divide-y divide-border">
        {actions.map((a, i) => {
          const k = KIND[a.kind];
          const Icon = k.icon;
          return (
            <li key={`${a.kind}-${a.itemId ?? i}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${k.tone}`} aria-hidden />
              <p className="flex-1 text-[13px] leading-relaxed text-text-secondary">{a.text}</p>
              {k.link && (
                <Link
                  href={k.link.href}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-500 text-text-primary transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-data"
                >
                  {k.link.label}
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
