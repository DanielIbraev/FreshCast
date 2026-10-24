"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Undo2 } from "lucide-react";
import { Mark } from "@/components/brand/mark";
import { NAV, STATUS } from "@/components/sidebar";
import { useNavTransition } from "@/components/nav-transition";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Phones and tablets: a slim top bar plus a thumb-reach tab bar at the bottom.
export function MobileTopBar() {
  const { profile, dbStatus, backToDemo } = useStore();
  const { pending } = useNavTransition();
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
      <Mark size={28} animating={pending} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-600 text-text-primary">{profile.name}</p>
        <p className="flex items-center gap-1.5 truncate text-[11px] text-text-muted">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS[dbStatus].dot)} />
          {STATUS[dbStatus].text}
        </p>
      </div>
      {profile.isDemo ? (
        <Link href="/setup" aria-label="Set up your restaurant" className="rounded-md border border-border p-2 text-good">
          <Store className="h-4 w-4" />
        </Link>
      ) : (
        <button onClick={backToDemo} aria-label="Back to the demo restaurant" className="rounded-md border border-border p-2 text-good">
          <Undo2 className="h-4 w-4" />
        </button>
      )}
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
