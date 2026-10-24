import { Sidebar } from "@/components/sidebar";
import { StoreProvider } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-screen bg-canvas">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1240px] px-8 py-7">{children}</div>
        </main>
      </div>
    </StoreProvider>
  );
}
