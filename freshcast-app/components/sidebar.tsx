"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, ShoppingCart, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_RESTAURANT } from "@/lib/demo-data";

const NAV = [
  { href: "/dashboard", label: "Forecast", icon: LayoutDashboard },
  { href: "/log", label: "Log Waste", icon: ClipboardList },
  { href: "/orders", label: "Smart Order", icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-good">
          <Leaf className="h-5 w-5 text-canvas" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-700 text-text-primary">
          FreshCast
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-surface-hover text-text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border px-5 py-4">
        <p className="text-sm font-500 text-text-primary">
          {DEMO_RESTAURANT.name}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">Boston, MA</p>
      </div>
    </aside>
  );
}
