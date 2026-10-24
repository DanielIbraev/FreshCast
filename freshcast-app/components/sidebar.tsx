"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, ClipboardList, Gauge, LayoutDashboard, Leaf, RotateCcw, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_RESTAURANT } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/dashboard", label: "Forecast", icon: LayoutDashboard },
  { href: "/orders", label: "Prep & order", icon: ShoppingCart },
  { href: "/log", label: "Log waste", icon: ClipboardList },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/model", label: "Model accuracy", icon: Gauge },
];

export function Sidebar() {
  const pathname = usePathname();
  const { resetDemo, dbStatus } = useStore();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-good">
          <Leaf className="h-[18px] w-[18px] text-canvas" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-700 text-text-primary">FreshCast</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-2" aria-label="Main">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                active ? "bg-surface-hover font-500 text-text-primary" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active && "text-good")} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border px-5 py-4">
        <p className="text-sm font-500 text-text-primary">{DEMO_RESTAURANT.name}</p>
        <p className="mt-0.5 text-xs text-text-muted">North End, Boston · 60 seats</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
          <span className={cn("h-1.5 w-1.5 rounded-full", dbStatus === "connected" ? "bg-good" : dbStatus === "loading" ? "bg-text-muted" : "bg-caution")} />
          {dbStatus === "connected" ? "Synced to Supabase" : dbStatus === "loading" ? "Connecting" : "Saved on this device"}
        </p>
        <button onClick={resetDemo} className="mt-3 flex items-center gap-1.5 text-xs text-text-muted transition-colors duration-150 hover:text-text-primary">
          <RotateCcw className="h-3 w-3" /> Reset demo data
        </button>
      </div>
    </aside>
  );
}
