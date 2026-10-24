// Reads a sales export (Square, Toast, Clover, or any CSV with a date column)
// and learns the restaurant's guests by weekday. Runs entirely in the browser;
// the file never leaves the device.

export interface PosImport {
  days: number; // distinct dates found
  coversByDay: number[]; // average guests per weekday, 0 = Sunday
  avgCovers: number;
  guestColumn: string | null; // null = counted one guest per ticket row
  dateColumn: string;
  firstDate: string;
  lastDate: string;
}

const MAX_BYTES = 5_000_000;

// Minimal RFC 4180 parser: handles quoted fields, escaped quotes and CRLF.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

// Accepts 2026-10-03, 10/3/2026, 10/03/26, and ISO timestamps.
function toISODate(v: string): string | null {
  const t = v.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) return iso(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[1], +m[2]);
  return null;
}
function iso(y: number, mo: number, d: number): string | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function importPosCsv(text: string): PosImport {
  if (text.length > MAX_BYTES) throw new Error("That file is over 5 MB. Export a shorter date range (8-12 weeks is plenty).");
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("The file looks empty.");
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const dateIdx = header.findIndex((h) => /date|day|business date|opened/.test(h));
  if (dateIdx < 0) throw new Error("Couldn't find a date column. The first row should be column names.");
  const guestIdx = header.findIndex((h) => /guest|cover|party size|pax|people/.test(h));

  const totals = new Map<string, number>();
  for (const r of rows.slice(1)) {
    const d = toISODate(r[dateIdx] ?? "");
    if (!d) continue;
    const g = guestIdx >= 0 ? Number(String(r[guestIdx] ?? "").replace(/[^0-9.]/g, "")) : 1;
    if (!Number.isFinite(g) || g < 0 || g > 2000) continue;
    totals.set(d, (totals.get(d) ?? 0) + g);
  }
  if (totals.size < 7) throw new Error(`Only found ${totals.size} days of sales. Export at least 2 weeks.`);

  const byDow: number[][] = [[], [], [], [], [], [], []];
  totals.forEach((g, d) => {
    const [y, m, day] = d.split("-").map(Number);
    byDow[new Date(y, m - 1, day).getDay()].push(g);
  });
  const all = Array.from(totals.values());
  const avgCovers = Math.round(all.reduce((s, x) => s + x, 0) / all.length);
  // A weekday with no data (e.g. closed Mondays) borrows the overall average.
  const coversByDay = byDow.map((xs) => (xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : avgCovers));
  const dates = Array.from(totals.keys()).sort();

  return {
    days: totals.size,
    coversByDay,
    avgCovers,
    guestColumn: guestIdx >= 0 ? rows[0][guestIdx].trim() : null,
    dateColumn: rows[0][dateIdx].trim(),
    firstDate: dates[0],
    lastDate: dates[dates.length - 1],
  };
}
