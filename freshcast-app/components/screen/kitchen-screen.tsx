"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { parseLocalDate, localISO } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { Lang, loadLang, saveLang } from "@/lib/i18n";
import { clockText, dateText, dayName, reason, ts } from "@/lib/i18n-screen";
import { PrepItem, PrepRow, PrepRowSkeleton } from "./prep-row";
import { TopBar } from "./top-bar";

const r1 = (n: number) => Math.round(n * 10) / 10;
const DONE_PREFIX = "freshcast:screen-done:";

// Which items the line has ticked off, per restaurant and day. A new day gets
// a new key, so the list starts fresh each morning; older days are cleared.
function useDone(restaurantId: string, date: string | null) {
  const key = date ? `${DONE_PREFIX}${restaurantId}:${date}` : null;
  const [state, setState] = useState<{ key: string | null; ids: Set<string> }>({ key: null, ids: new Set() });

  useEffect(() => {
    if (!key) return;
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(key) ?? "[]");
      for (let n = localStorage.length - 1; n >= 0; n--) {
        const k = localStorage.key(n);
        if (k?.startsWith(`${DONE_PREFIX}${restaurantId}:`) && k !== key) localStorage.removeItem(k);
      }
    } catch {
      ids = [];
    }
    setState({ key, ids: new Set(ids) });
  }, [key, restaurantId]);

  const toggle = useCallback((id: string) => {
    setState((s) => {
      const ids = new Set(s.ids);
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      if (s.key) localStorage.setItem(s.key, JSON.stringify([...ids]));
      return { ...s, ids };
    });
  }, []);

  return { done: state.key === key ? state.ids : new Set<string>(), toggle };
}

export function KitchenScreen() {
  const { profile, today, week, ready } = useStore();
  const reduce = useReducedMotion();
  const [lang, setLangState] = useState<Lang>("en");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setLangState(loadLang()), []);
  const setLang = (l: Lang) => {
    setLangState(l);
    saveLang(l);
  };

  // Clock. The tablet stays on all day, so when the date rolls over, reload to
  // get the new day's forecast and weather.
  useEffect(() => {
    const opened = localISO(new Date());
    const tick = () => {
      const d = new Date();
      setNow(d);
      if (localISO(d) !== opened) window.location.reload();
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  const t = ts(lang);
  const closedToday = !!today?.closed;
  const day = !today ? null : closedToday ? week.find((d) => !d.closed) ?? null : today;
  const date = day ? parseLocalDate(day.date) : null;
  const { done, toggle } = useDone(profile.id, day?.date ?? null);

  const items: PrepItem[] = useMemo(() => {
    if (!day || !date) return [];
    return [...day.ingredients]
      .sort((a, b) => b.cutKg * b.ingredient.costPerKg - a.cutKg * a.ingredient.costPerKg)
      .map((p) => {
        const prepKg = r1(p.recommendedPrepKg);
        const usualKg = r1(p.usualPrepKg);
        return {
          id: p.ingredient.id,
          name: p.ingredient.name,
          prepKg,
          usualKg,
          lessKg: Math.max(0, r1(usualKg - prepKg)),
          reason: reason(lang, p.primaryDriver, {
            date,
            condition: day.weather.condition,
            shelfLifeDays: p.ingredient.shelfLifeDays,
            usual: day.usualCovers,
            expected: day.expectedCovers,
          }),
        };
      });
  }, [day, date, lang]);

  const cutKg = day ? day.ingredients.reduce((s, p) => s + (p.usualPrepKg - p.recommendedPrepKg), 0) : 0;
  const cutMoney = day ? day.ingredients.reduce((s, p) => s + (p.usualPrepKg - p.recommendedPrepKg) * p.ingredient.costPerKg, 0) : 0;
  const isTomorrow = !!day && day === week[0];
  const heading = closedToday && date ? t.closedToday(dayName(lang, date), isTomorrow) : t.today;
  const show = ready && !!day;
  const rows = Math.max(1, Math.ceil((show ? items.length : 8) / 2));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas text-text-primary lg:h-[100dvh] lg:overflow-hidden">
      <TopBar
        restaurant={profile.name}
        heading={show ? heading : t.today}
        date={date ? dateText(lang, date) : ""}
        condition={show ? day!.weather.condition : null}
        tempF={show ? day!.weather.tempF : null}
        guests={show && date ? t.guests(day!.usualCovers, date) : null}
        clock={now ? clockText(lang, now) : ""}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      <main className="flex-1 px-4 py-4 sm:px-6 lg:min-h-0 lg:overflow-y-auto">
        {show && items.length === 0 ? (
          <p className="pt-10 text-2xl text-text-secondary">{t.nothing}</p>
        ) : (
          <motion.ul
            key={show ? "list" : "skeleton"}
            initial={show && !reduce ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ "--rows": rows } as React.CSSProperties}
            className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 lg:min-h-full lg:grid-flow-col lg:grid-cols-2 lg:[grid-template-rows:repeat(var(--rows),minmax(min-content,1fr))]"
            aria-busy={!show}
          >
            {show
              ? items.map((it) => <PrepRow key={it.id} item={it} done={done.has(it.id)} onToggle={() => toggle(it.id)} t={t} />)
              : Array.from({ length: 8 }, (_, n) => <PrepRowSkeleton key={n} />)}
          </motion.ul>
        )}
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border px-4 py-3 text-lg text-text-secondary sm:px-6">
        {show ? (
          <p>{t.footer(r1(cutKg).toFixed(1), formatCurrency(cutMoney))}</p>
        ) : (
          <span className="h-6 w-80 max-w-full animate-pulse rounded-md bg-surface" aria-hidden />
        )}
        <div className="flex items-center gap-5">
          {show && items.length > 0 && <span className="tabular-nums">{t.progress(items.filter((i) => done.has(i.id)).length, items.length)}</span>}
          <Link
            href="/orders"
            className="flex min-h-[44px] items-center gap-2 rounded-md border border-border px-3 text-base text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t.exit}
          </Link>
        </div>
      </footer>
    </div>
  );
}
