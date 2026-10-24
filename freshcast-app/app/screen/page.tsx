"use client";

import { StoreProvider } from "@/lib/store";
import { KitchenScreen } from "@/components/screen/kitchen-screen";

// The kitchen screen: today's prep in big type for a tablet on the wall.
// Outside the (app) group, so there is no sidebar. `?r=<id>` picks the kitchen.
export default function ScreenPage() {
  return (
    <StoreProvider>
      <KitchenScreen />
    </StoreProvider>
  );
}
