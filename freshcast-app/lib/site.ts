// Public URL used for QR codes, so a deck recorded on localhost still points
// judges to the live site.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://freshcast-taupe.vercel.app").replace(/\/$/, "");
