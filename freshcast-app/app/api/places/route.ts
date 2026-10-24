import { NextRequest, NextResponse } from "next/server";
import { osmCuisineToType } from "@/lib/staples";
import { parseOpeningHours } from "@/lib/opening-hours";
import type { PlaceResult } from "@/components/setup/draft";

export const dynamic = "force-dynamic";

// Restaurant search for setup, via OpenStreetMap Nominatim. Usage policy:
// descriptive User-Agent, at most 1 request per second, no autocomplete.
// https://operations.osmfoundation.org/policies/nominatim/

interface NominatimHit {
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category?: string;
  class?: string;
  type: string;
  name?: string;
  display_name: string;
  address?: Record<string, string>;
  extratags?: Record<string, string> | null;
  namedetails?: Record<string, string> | null;
}

const FOOD_AMENITIES = new Set(["restaurant", "cafe", "fast_food", "bar", "pub", "food_court", "ice_cream"]);
const isFood = (h: NominatimHit) => {
  const cls = h.category ?? h.class;
  return (cls === "amenity" && FOOD_AMENITIES.has(h.type)) || (cls === "shop" && h.type === "bakery");
};

// Space requests from this server instance at least 1.1s apart.
let nextSlot = 0;
async function politeSlot() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = now + wait + 1100;
  if (wait) await new Promise((r) => setTimeout(r, wait));
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

function toResult(h: NominatimHit): PlaceResult {
  const a = h.address ?? {};
  const x = h.extratags ?? {};
  const city = a.city || a.town || a.village || a.hamlet || a.county || "";
  const area = a.neighbourhood || a.suburb || a.quarter || a.city_district || "";
  const iso = a["ISO3166-2-lvl4"] ?? "";
  const state = iso.startsWith("US-") ? iso.slice(3) : a.state || "";
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const statePost = [state, a.postcode].filter(Boolean).join(" ");
  const address = [street, city, statePost].filter(Boolean).join(", ") || h.display_name.split(",").slice(1, 4).join(",").trim();
  const hours = parseOpeningHours(x.opening_hours);
  const cuisineTag = x.cuisine ?? null;
  return {
    osmId: `${h.osm_type}/${h.osm_id}`,
    name: h.namedetails?.name || h.name || h.display_name.split(",")[0],
    address,
    place: [area, city].filter(Boolean).join(", ") || city || state,
    lat: Number(h.lat),
    lng: Number(h.lon),
    osmType: h.type,
    cuisineTag,
    cuisineType: osmCuisineToType(cuisineTag ?? undefined, h.type),
    openingHours: x.opening_hours ?? null,
    openDays: hours.openDays,
    service: hours.service,
    phone: x.phone || x["contact:phone"] || null,
    website: x.website || x["contact:website"] || null,
  };
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const near = (req.nextUrl.searchParams.get("near") ?? "").trim();
  if (q.length < 2 || q.length > 100) return fail("Enter your restaurant's name (2 to 100 characters).", 400);
  if (near.length > 100) return fail("Keep the city or ZIP under 100 characters.", 400);

  const query = near ? `${q}, ${near}` : q;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&namedetails=1&limit=8&q=${encodeURIComponent(query)}`;

  let hits: NominatimHit[];
  try {
    await politeSlot();
    const res = await fetch(url, {
      headers: { "User-Agent": "FreshCast/0.3 (hackathon; github.com/DanielIbraev/FreshCast)", "Accept-Language": "en" },
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
    });
    if (res.status === 429 || res.status === 403) return fail("The map search is busy. Wait a few seconds and try again.", 503);
    if (!res.ok) return fail("The map search is unavailable right now. Try again, or enter your details by hand.", 502);
    const body: unknown = await res.json();
    hits = Array.isArray(body) ? (body as NominatimHit[]) : [];
  } catch {
    return fail("The map search didn't answer in time. Try again, or enter your details by hand.", 504);
  }

  const results = hits.filter(isFood).map(toResult).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
  if (!results.length) {
    return fail(
      hits.length
        ? `Found places matching "${q}", but none are listed as a restaurant, café or bakery.`
        : `No match for "${q}"${near ? ` near ${near}` : ""}. Check the spelling, add the city, or enter your details by hand.`,
      404
    );
  }
  return NextResponse.json({ results });
}
