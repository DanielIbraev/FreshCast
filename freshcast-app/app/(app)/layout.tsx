import { Sidebar } from "@/components/sidebar";
import { MobileTabBar, MobileTopBar } from "@/components/mobile-nav";
import { StoreProvider } from "@/lib/store";
import { NavOverlay, NavTransitionProvider } from "@/components/nav-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <NavTransitionProvider>
        <div className="flex h-[100dvh] bg-canvas">
          <Sidebar />
          <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <MobileTopBar />
            <NavOverlay />
            <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-5 md:px-8 md:pb-7 md:pt-7">{children}</div>
          </main>
          <MobileTabBar />
        </div>
      </NavTransitionProvider>
    </StoreProvider>
  );
}
