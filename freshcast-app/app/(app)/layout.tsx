import { Sidebar } from "@/components/sidebar";
import { StoreProvider } from "@/lib/store";
import { NavOverlay, NavTransitionProvider } from "@/components/nav-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <NavTransitionProvider>
        <div className="flex h-screen bg-canvas">
          <Sidebar />
          <main className="relative flex-1 overflow-y-auto">
            <NavOverlay />
            <div className="mx-auto max-w-[1240px] px-8 py-7">{children}</div>
          </main>
        </div>
      </NavTransitionProvider>
    </StoreProvider>
  );
}
