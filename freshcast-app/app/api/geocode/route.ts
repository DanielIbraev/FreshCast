import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Address → coordinates for live weather, via OpenStreetMap Nominatim.
// Their usage policy requires a descriptive User-Agent and light traffic,
// which a one-time setup lookup is.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3 || q.length > 200) return NextResponse.json({ error: "Enter a street address or neighborhood and city." }, { status: 400 });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FreshCast/0.2 (hackathon demo; github.com/DanielIbraev/FreshCast)", "Accept-Language": "en" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const hits = (await res.json()) as { lat: string; lon: string; display_name: string; address?: Record<string, string> }[];
    if (!hits.length) return NextResponse.json({ error: "Couldn't find that address. Try adding the city." }, { status: 404 });
    const h = hits[0];
    const a = h.address ?? {};
    const area = a.neighbourhood || a.suburb || a.quarter || a.city_district || "";
    const city = a.city || a.town || a.village || a.county || "";
    return NextResponse.json({
      lat: Number(h.lat),
      lng: Number(h.lon),
      place: [area, city].filter(Boolean).join(", ") || h.display_name.split(",").slice(0, 2).join(","),
    });
  } catch {
    return NextResponse.json({ error: "Address lookup is unavailable right now. Try again in a moment." }, { status: 502 });
  }
}
