// Strings for the kitchen screen (/screen), the wall tablet the line reads
// from. English and kitchen Spanish; the language choice is shared with the
// Log screen through the same freshcast:lang key (see lib/i18n.ts).

import type { Lang } from "./i18n";
import type { SignalFactor, WeatherCondition } from "./types";

const LOCALE: Record<Lang, string> = { en: "en-US", es: "es-US" };

const weekday = (lang: Lang, d: Date) => d.toLocaleDateString(LOCALE[lang], { weekday: "long" });
const plural = (lang: Lang, d: Date) => (lang === "en" ? `${weekday(lang, d)}s` : `los ${weekday(lang, d)}`);
const month = (lang: Lang, d: Date) => d.toLocaleDateString(LOCALE[lang], { month: "long" });
const kg = (n: number) => `${n.toFixed(1)} kg`;

const STRINGS = {
  en: {
    today: "Today's prep",
    closedToday: (day: string, isTomorrow: boolean) => `Closed today. ${isTomorrow ? "Tomorrow" : day}'s prep:`,
    guests: (n: number, d: Date) => `Usually ${n} guests on ${plural("en", d)}`,
    weather: { rain: "Rain", storm: "Storms", hot: "Hot", cold: "Cold", normal: "Dry" } as Record<WeatherCondition, string>,
    prep: "Prep",
    usual: "usual",
    less: (n: number) => `−${kg(n)}`,
    asUsual: "Prep as usual",
    done: "Done",
    markDone: (name: string) => `Mark ${name} done`,
    markUndone: (name: string) => `Mark ${name} not done`,
    progress: (done: number, total: number) => `${done} of ${total} done`,
    footer: (kgCut: string, money: string) => `Plan cuts ${kgCut} kg and ${money} versus usual prep`,
    exit: "Exit",
    lang: "Language",
    nothing: "No prep list yet. Add ingredients in Kitchen setup.",
  },
  es: {
    today: "Preparación de hoy",
    closedToday: (day: string, isTomorrow: boolean) => `Cerrado hoy. Preparación ${isTomorrow ? "de mañana" : `del ${day}`}:`,
    guests: (n: number, d: Date) => `Suelen venir ${n} clientes ${plural("es", d)}`,
    weather: { rain: "Lluvia", storm: "Tormentas", hot: "Calor", cold: "Frío", normal: "Seco" } as Record<WeatherCondition, string>,
    prep: "Preparar",
    usual: "de costumbre",
    less: (n: number) => `−${kg(n)}`,
    asUsual: "Igual que siempre",
    done: "Hecho",
    markDone: (name: string) => `Marcar ${name} como hecho`,
    markUndone: (name: string) => `Desmarcar ${name}`,
    progress: (done: number, total: number) => `${done} de ${total} hechos`,
    footer: (kgCut: string, money: string) => `El plan prepara ${kgCut} kg menos y ahorra ${money} frente a lo de costumbre`,
    exit: "Salir",
    lang: "Idioma",
    nothing: "Todavía no hay lista. Agrega ingredientes en la configuración de cocina.",
  },
};

export type ScreenStrings = (typeof STRINGS)["en"];
export const ts = (lang: Lang): ScreenStrings => STRINGS[lang] as ScreenStrings;

export const dayName = (lang: Lang, d: Date) => weekday(lang, d);
export const clockText = (lang: Lang, d: Date) => d.toLocaleTimeString(LOCALE[lang], { hour: "numeric", minute: "2-digit" });
export const dateText = (lang: Lang, d: Date) => d.toLocaleDateString(LOCALE[lang], { weekday: "long", month: "long", day: "numeric" });

// The biggest signal behind an item's forecast, said the way a cook would say
// it. `value` > 1 means the signal pushes waste up (so the plan cuts more).
export function reason(lang: Lang, s: SignalFactor, ctx: { date: Date; condition: WeatherCondition; shelfLifeDays: number; usual: number; expected: number }): string {
  const up = s.value >= 1;
  const en = lang === "en";
  switch (s.key) {
    case "demand":
      return en
        ? `${ctx.expected} guests, usually ${ctx.usual}`
        : `${ctx.expected} clientes, normalmente ${ctx.usual}`;
    case "weather": {
      const w = {
        en: { rain: "Rain today", storm: "Storms today", hot: "Hot day", cold: "Cold day", normal: "Dry weather" },
        es: { rain: "Lluvia hoy", storm: "Tormentas hoy", hot: "Día de calor", cold: "Día frío", normal: "Tiempo seco" },
      };
      return w[lang][ctx.condition];
    }
    case "dayOfWeek":
      return en
        ? `${up ? "More" : "Less"} left over on ${plural("en", ctx.date)}`
        : `${up ? "Sobra más" : "Sobra menos"} ${plural("es", ctx.date)}`;
    case "season":
      return en
        ? `${month("en", ctx.date)} leaves ${up ? "more" : "less"} over`
        : `En ${month("es", ctx.date)} sobra ${up ? "más" : "menos"}`;
    case "holiday":
      return s.detail;
    case "event":
      return s.detail;
    case "shelfLife": {
      const n = ctx.shelfLifeDays;
      return en ? `Shelf life ${n} day${n === 1 ? "" : "s"}` : `Dura ${n} día${n === 1 ? "" : "s"}`;
    }
    case "recency":
      return en
        ? `${up ? "More" : "Less"} left over last ${weekday("en", ctx.date)}`
        : `${up ? "Sobró más" : "Sobró menos"} el ${weekday("es", ctx.date)} pasado`;
    case "calibration":
      return en ? (up ? "This one usually comes back" : "This one usually sells out") : up ? "Esto suele sobrar" : "Esto suele acabarse";
  }
}
