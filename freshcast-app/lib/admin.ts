// Owner mode. Visit any page once with ?admin=YOUR_TOKEN to unlock writes on
// this device; ?admin=off locks it again. The token is kept in localStorage and
// removed from the address bar immediately so it never shows on screen.

const KEY = "freshcast:admin";

export function readAdminToken(): string | null {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("admin");
  if (fromUrl !== null) {
    if (fromUrl === "off" || fromUrl === "") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, fromUrl.trim());
    url.searchParams.delete("admin");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  return localStorage.getItem(KEY);
}
