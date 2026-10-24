// Reads the common subset of OpenStreetMap `opening_hours` strings into the
// two things setup needs: which weekdays are open and the service style.
// Spec: https://wiki.openstreetmap.org/wiki/Key:opening_hours
// Anything we don't understand (sunrise, week numbers, odd syntax) falls back
// to "open every day, service unknown" so the owner just picks by hand.

import { ServiceStyle } from "./types";

export interface ParsedHours {
  openDays: boolean[]; // 0 = Sunday
  service: ServiceStyle | null;
}

const DAY_CODES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY = "(?:Mo|Tu|We|Th|Fr|Sa|Su)";
const DAY_ITEM = `(?:${DAY}(?:\\s*-\\s*${DAY})?(?:\\[[^\\]]*\\])?|PH|SH)`;
const DAY_SELECTOR = new RegExp(`^(${DAY_ITEM}(?:\\s*,\\s*${DAY_ITEM})*)(?=\\s|$|:)\\s*:?\\s*`);
const TIME_SPAN = /^(\d{1,2}):(\d{2})\s*(?:-\s*(\d{1,2}):(\d{2})|\+)$/;
// Holidays, months, dates, weeks: rules that only apply some of the year.
const SEASONAL = /^(?:PH|SH|easter|week|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;

type Span = [number, number]; // minutes from midnight, end may pass 24:00

const fallback = (): ParsedHours => ({ openDays: Array(7).fill(true), service: null });

function parseDays(sel: string): number[] {
  const out = new Set<number>();
  for (const raw of sel.split(",")) {
    const item = raw.replace(/\[[^\]]*\]/g, "").trim();
    if (item === "PH" || item === "SH") continue;
    const [a, b] = item.split("-").map((x) => DAY_CODES.indexOf(x.trim()));
    if (a < 0) continue;
    if (b === undefined || b < 0) {
      out.add(a);
      continue;
    }
    // Ranges can wrap the week: Fr-Mo = Fr, Sa, Su, Mo.
    for (let d = a, n = 0; n < 7; d = (d + 1) % 7, n++) {
      out.add(d);
      if (d === b) break;
    }
  }
  return Array.from(out);
}

function parseTimes(text: string): Span[] | null {
  const spans: Span[] = [];
  for (const part of text.split(",")) {
    const m = part.trim().match(TIME_SPAN);
    if (!m) return null;
    const start = Number(m[1]) * 60 + Number(m[2]);
    let end = m[3] === undefined ? 24 * 60 : Number(m[3]) * 60 + Number(m[4]);
    if (start > 24 * 60 || end > 48 * 60) return null;
    if (end <= start) end += 24 * 60; // overnight, e.g. 18:00-02:00
    spans.push([start, end]);
  }
  return spans.length ? spans : null;
}

// Per day: null = closed, [] = open with no times given, spans otherwise.
function applyRule(rule: string, week: (Span[] | null)[]): boolean {
  let text = rule.replace(/"[^"]*"/g, "").trim();
  if (!text) return true;
  let days = [0, 1, 2, 3, 4, 5, 6];
  const sel = text.match(DAY_SELECTOR);
  if (sel) {
    days = parseDays(sel[1]);
    text = text.slice(sel[0].length).trim();
    if (!days.length) return true; // PH-only rule: holidays don't change weekdays
  } else if (SEASONAL.test(text)) {
    return true; // seasonal exception: ignore, don't fail the whole string
  }
  const closed = /^(off|closed)$/i.test(text);
  const spans = closed ? null : text === "" || /^open$/i.test(text) ? [] : parseTimes(text);
  if (!closed && spans === null) return false;
  for (const d of days) week[d] = spans;
  return true;
}

function classify(spans: Span[]): ServiceStyle {
  const open = Math.min(...spans.map((s) => s[0]));
  const close = Math.max(...spans.map((s) => s[1]));
  if (close <= 16 * 60) return open < 10 * 60 ? "breakfast_lunch" : "lunch";
  if (open >= 16 * 60) return "dinner";
  return "all_day";
}

export function parseOpeningHours(s: string | undefined): ParsedHours {
  try {
    const src = (s ?? "").trim();
    if (!src || src.length > 500) return fallback();
    if (/^24\/7/.test(src)) return { openDays: Array(7).fill(true), service: "all_day" };

    const week: (Span[] | null)[] = Array(7).fill(null);
    // ";" and "||" separate rules; ", " after a time or "off" also starts a new
    // rule (but "Mo,We,Fr" is one day list).
    const rules = src
      .split(/;|\|\|/)
      .flatMap((r) => r.split(new RegExp(`(?<=\\d|off|closed)\\s*,\\s*(?=${DAY_ITEM}\\b)`)));
    let parsed = 0;
    for (const r of rules) {
      if (!r.trim()) continue;
      if (!applyRule(r, week)) return fallback();
      parsed++;
    }
    const openDays = week.map((w) => w !== null);
    if (!parsed || !openDays.some(Boolean)) return fallback();

    // Majority vote across open days that list times ("mostly closes by 4pm").
    const votes = new Map<ServiceStyle, number>();
    for (const w of week) {
      if (!w || !w.length) continue;
      const c = classify(w);
      votes.set(c, (votes.get(c) ?? 0) + 1);
    }
    const ranked = Array.from(votes).sort((a, b) => b[1] - a[1]);
    return { openDays, service: ranked[0]?.[0] ?? null };
  } catch {
    return fallback();
  }
}
