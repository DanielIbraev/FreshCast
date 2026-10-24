"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, ClipboardList, Gauge, LayoutDashboard, RotateCcw, ShoppingCart } from "lucide-react";
import { RestaurantSwitcher } from "@/components/restaurant-switcher";
import { Mark } from "@/components/brand/mark";
import { useNavTransition } from "@/components/nav-transition";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { DbStatus } from "@/lib/db";

export const NAV = [
  { href: "/dashboard", label: "Forecast", short: "Forecast", icon: LayoutDashboard },
  { href: "/orders", label: "Prep & order", short: "Prep", icon: ShoppingCart },
  { href: "/log", label: "Log waste", short: "Log", icon: ClipboardList },
  { href: "/kitchen", label: "Kitchen", short: "Kitchen", icon: ChefHat },
  { href: "/model", label: "Model accuracy", short: "Model", icon: Gauge },
];

// What each data mode means, in plain words. Public visitors are sandboxed:
// Postgres rejects their writes, so the demo can't be vandalized.
export const STATUS: Record<DbStatus, { dot: string; text: string; title: string }> = {
  connected: { dot: "bg-good", text: "Owner, synced to Supabase", title: "Writes verified by Postgres row-level security" },
  sandbox: { dot: "bg-data", text: "Demo sandbox: edits stay on this device", title: "Public visitors can read the demo; only the owner can change it" },
  local: { dot: "bg-caution", text: "Offline, saved on this device", title: "Database unreachable" },
  loading: { dot: "bg-text-muted", text: "Connecting", title: "" },
};

const plain = (e: React.MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0);

export function Sidebar() {
  const pathname = usePathname();
  const { resetDemo, dbStatus, profile } = useStore();
  const { start } = useNavTransition();
  const st = STATUS[dbStatus];

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex print:hidden">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Mark size={32} />
        <span className="font-display text-lg font-700 text-text-primary">FreshCast</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-2" aria-label="Main">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => plain(e) && start(href)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                active ? "bg-surface-hover font-600 text-text-primary" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active && "text-good")} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border px-3 py-4">
        <RestaurantSwitcher />
        <p className="mt-2 px-1 text-xs leading-snug text-text-muted">
          {profile.place}
          <span className="block">{profile.seats} seats{profile.isDemo ? ", fictional demo" : ""}</span>
        </p>
        <p className="mt-2 flex items-start gap-1.5 px-1 text-xs leading-snug text-text-muted" title={st.title}>
          <span className={cn("mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full", st.dot)} />
          <span className="[text-wrap:balance]">{st.text}</span>
        </p>
        <div className="mt-1.5 flex flex-col">
          {/* py-2 gives the text button a 32px hit area without changing how it looks. */}
          <button onClick={resetDemo} className="flex items-center gap-1.5 self-start rounded-md px-1 py-2 text-xs text-text-muted transition-colors duration-150 hover:text-text-primary">
            <RotateCcw className="h-3 w-3" /> {profile.isDemo ? "Reset demo data" : "Clear my logs"}
          </button>
        </div>
      </div>
    </aside>
  );
}
