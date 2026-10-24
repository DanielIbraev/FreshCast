"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/brand/mark";
import { NAV, STATUS } from "@/components/sidebar";
import { useNavTransition } from "@/components/nav-transition";
import { useStore } from "@/lib/store";
import { RestaurantSwitcher } from "@/components/restaurant-switcher";
import { cn } from "@/lib/utils";

// Phones and tablets: a slim top bar plus a thumb-reach tab bar at the bottom.
export function MobileTopBar() {
  const { dbStatus } = useStore();
  const { pending } = useNavTransition();
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
      <Mark size={28} animating={pending} />
      <div className="min-w-0 flex-1">
        <RestaurantSwitcher compact />
      </div>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS[dbStatus].dot)} title={STATUS[dbStatus].text} aria-label={STATUS[dbStatus].text} />
    </div>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { start } = useNavTransition();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map(({ href, short, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} onClick={() => start(href)} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "text-good" : "text-text-muted")}>
            <Icon className="h-5 w-5" strokeWidth={2} />
            {short}
          </Link>
        );
      })}
    </nav>
  );
}
