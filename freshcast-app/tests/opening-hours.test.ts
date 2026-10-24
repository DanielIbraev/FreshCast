import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { parseOpeningHours } from "@/lib/opening-hours";

// Days are indexed 0 = Sunday ... 6 = Saturday.
const days = (...open: number[]) => Array.from({ length: 7 }, (_, i) => open.includes(i));
const ALL = days(0, 1, 2, 3, 4, 5, 6);

describe("parseOpeningHours: examples", () => {
  it("weekday lunch plus a short Saturday", () => {
    expect(parseOpeningHours("Mo-Fr 11:00-15:00; Sa 10:00-14:00")).toEqual({ openDays: days(1, 2, 3, 4, 5, 6), service: "lunch" });
  });

  it("dinner spot closed Mondays", () => {
    expect(parseOpeningHours("Tu-Su 17:00-22:00")).toEqual({ openDays: days(0, 2, 3, 4, 5, 6), service: "dinner" });
  });

  it("24/7", () => {
    expect(parseOpeningHours("24/7")).toEqual({ openDays: ALL, service: "all_day" });
  });

  it("breakfast and lunch with Sunday off", () => {
    expect(parseOpeningHours("Mo-Sa 07:00-15:00; Su off")).toEqual({ openDays: days(1, 2, 3, 4, 5, 6), service: "breakfast_lunch" });
  });

  it("comma-separated day list", () => {
    expect(parseOpeningHours("Mo,We,Fr 08:00-20:00")).toEqual({ openDays: days(1, 3, 5), service: "all_day" });
  });

  it("day ranges that wrap the week", () => {
    expect(parseOpeningHours("Fr-Mo 18:00-23:00").openDays).toEqual(days(5, 6, 0, 1));
  });

  it("split lunch and dinner shifts count as all day", () => {
    expect(parseOpeningHours("Mo-Su 11:30-14:30,17:00-22:00")).toEqual({ openDays: ALL, service: "all_day" });
  });

  it("past midnight closing stays a dinner spot", () => {
    expect(parseOpeningHours("We-Sa 18:00-02:00")).toEqual({ openDays: days(3, 4, 5, 6), service: "dinner" });
  });

  it("later rules override earlier ones for the same day", () => {
    expect(parseOpeningHours("Mo-Su 08:00-14:00; Mo off").openDays).toEqual(days(0, 2, 3, 4, 5, 6));
  });

  it("additional rule after a comma", () => {
    expect(parseOpeningHours("Mo-Fr 07:00-15:00, Sa 08:00-13:00")).toEqual({ openDays: days(1, 2, 3, 4, 5, 6), service: "breakfast_lunch" });
  });

  it("majority wins when one day differs", () => {
    expect(parseOpeningHours("Mo-Fr 07:00-15:00; Sa 08:00-21:00").service).toBe("breakfast_lunch");
  });

  it("ignores holiday rules", () => {
    expect(parseOpeningHours("Tu-Su 17:00-22:00; PH off")).toEqual({ openDays: days(0, 2, 3, 4, 5, 6), service: "dinner" });
  });

  it("times without days apply to every day", () => {
    expect(parseOpeningHours("10:00-22:00")).toEqual({ openDays: ALL, service: "all_day" });
  });

  it("falls back on empty, missing and unparseable input", () => {
    const fallback = { openDays: ALL, service: null };
    expect(parseOpeningHours(undefined)).toEqual(fallback);
    expect(parseOpeningHours("")).toEqual(fallback);
    expect(parseOpeningHours("sunrise-sunset")).toEqual(fallback);
    expect(parseOpeningHours("by appointment")).toEqual(fallback);
    expect(parseOpeningHours("Mo-Su off")).toEqual(fallback);
  });
});

describe("parseOpeningHours: properties", () => {
  const SERVICES = [null, "breakfast_lunch", "lunch", "dinner", "all_day"];

  it("never throws and always returns 7 days on any string", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (s) => {
        const r = parseOpeningHours(s);
        expect(r.openDays).toHaveLength(7);
        expect(r.openDays.every((d) => typeof d === "boolean")).toBe(true);
        expect(SERVICES).toContain(r.service);
      }),
      { numRuns: 2000 }
    );
  });

  // Strings built from the real grammar, so the parser's main paths get hit.
  const day = fc.constantFrom("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su");
  const hhmm = fc.tuple(fc.integer({ min: 0, max: 24 }), fc.constantFrom("00", "15", "30", "45")).map(([h, m]) => `${String(h).padStart(2, "0")}:${m}`);
  const selector = fc.oneof(day, fc.tuple(day, day).map(([a, b]) => `${a}-${b}`), fc.array(day, { minLength: 1, maxLength: 3 }).map((d) => d.join(",")));
  const times = fc.oneof(fc.constant("off"), fc.array(fc.tuple(hhmm, hhmm).map(([a, b]) => `${a}-${b}`), { minLength: 1, maxLength: 2 }).map((t) => t.join(",")));
  const rule = fc.tuple(selector, times).map(([d, t]) => `${d} ${t}`);
  const hours = fc.array(rule, { minLength: 1, maxLength: 4 }).map((r) => r.join("; "));

  it("grammar-shaped strings: 7 days, and a known service whenever any day is closed", () => {
    fc.assert(
      fc.property(hours, (s) => {
        const r = parseOpeningHours(s);
        expect(r.openDays).toHaveLength(7);
        // A closed day means the string parsed, so service must be inferred.
        if (r.openDays.some((d) => !d)) expect(r.service).not.toBeNull();
      }),
      { numRuns: 1000 }
    );
  });

  it("a single rule opens exactly the days it names", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 0, max: 6 }), { minLength: 1, maxLength: 7 }), (picked) => {
        const codes = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const r = parseOpeningHours(`${picked.map((d) => codes[d]).join(",")} 11:00-21:00`);
        expect(r.openDays).toEqual(days(...picked));
        expect(r.service).toBe("all_day");
      })
    );
  });
});
