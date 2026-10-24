// Shared demo constants and date helpers.

import { Restaurant, Ingredient, EventType, NearbyEvent } from "./types";
import { KITCHENS } from "./kitchens";

export const DEMO_RESTAURANT: Restaurant = {
  id: "marcos-trattoria",
  name: "Marco's Trattoria",
  address: "214 Hanover St, Boston, MA 02113",
  lat: 42.3647,
  lng: -71.0542,
  cuisineType: "italian",
};

export const EVENTS: Record<EventType, NearbyEvent> = {
  none: { type: "none", name: "", distanceMiles: 0 },
  game: { type: "game", name: "Home game at the arena", distanceMiles: 0.6 },
  concert: { type: "concert", name: "Arena concert", distanceMiles: 0.6 },
  festival: { type: "festival", name: "Street festival nearby", distanceMiles: 0.2 },
  graduation: { type: "graduation", name: "University commencement", distanceMiles: 0.8 },
};

// Marco's menu lives in lib/kitchens.ts with the other demo kitchens.
export const DEMO_INGREDIENTS: Ingredient[] = KITCHENS["marcos-trattoria"].ingredients;

export function localISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
