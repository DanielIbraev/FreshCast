// Staff-facing strings for the Log waste screen, in English and Spanish.
// Many US line cooks and dishwashers are Spanish-first; the person tapping at
// close shouldn't need English to do it.

import { WasteReason } from "./types";

export type Lang = "en" | "es";

const STRINGS = {
  en: {
    title: "Log waste",
    sub: "Tap the item, then how much. About a minute at close, no scale needed.",
    thrown: "Thrown out today",
    entries: (kg: string, n: number) => `${kg}kg across ${n} entries`,
    co2: "CO₂ from today's waste",
    miles: (m: number) => `about ${m} miles of driving`,
    why: "Why it was thrown out",
    step1: "What went in the bin?",
    step1hint: "Tiles show what's been logged today",
    step2: (name: string) => `How much ${name}?`,
    reasonLabel: "Why (optional):",
    todayLog: "Today's log",
    empty: "Nothing logged yet today.",
    removed: "Removed item",
    undo: "Undo entry",
    amounts: ["A handful", "A bowl", "Half a pan", "A full pan", "Two pans"],
    reasons: { overprep: "Over-prepped", spoiled: "Spoiled", plate: "Plate waste", dropped: "Dropped" } as Record<WasteReason, string>,
    closeTitle: "Close out tonight",
    closeSub: (sb: boolean) => `Confirm how many guests you served. Saves today's totals${sb ? " to Supabase" : ""} and refits tomorrow's forecast.`,
    guests: "Guests served",
    booked: (n: number) => `usual ${n}`,
    closeBtn: "Close out today",
    closeAgain: "Close out again",
    saving: "Saving",
    saved: (n: number) => `${n} items saved for tonight.`,
  },
  es: {
    title: "Registrar desperdicio",
    sub: "Toca el producto y luego la cantidad. Un minuto al cerrar, sin báscula.",
    thrown: "Desechado hoy",
    entries: (kg: string, n: number) => `${kg}kg en ${n} registros`,
    co2: "CO₂ del desperdicio de hoy",
    miles: (m: number) => `como manejar unas ${m} millas`,
    why: "Por qué se desechó",
    step1: "¿Qué fue a la basura?",
    step1hint: "Lo registrado hoy aparece en cada producto",
    step2: (name: string) => `¿Cuánto ${name}?`,
    reasonLabel: "Motivo (opcional):",
    todayLog: "Registro de hoy",
    empty: "Nada registrado hoy.",
    removed: "Producto eliminado",
    undo: "Deshacer",
    amounts: ["Un puñado", "Un tazón", "Media bandeja", "Una bandeja", "Dos bandejas"],
    reasons: { overprep: "Preparado de más", spoiled: "Echado a perder", plate: "Sobras del plato", dropped: "Se cayó" } as Record<WasteReason, string>,
    closeTitle: "Cerrar la noche",
    closeSub: (sb: boolean) => `Confirma cuántos clientes atendiste. Guarda el total de hoy${sb ? " en Supabase" : ""} y ajusta el pronóstico de mañana.`,
    guests: "Clientes atendidos",
    booked: (n: number) => `normal ${n}`,
    closeBtn: "Cerrar hoy",
    closeAgain: "Cerrar de nuevo",
    saving: "Guardando",
    saved: (n: number) => `${n} productos guardados de esta noche.`,
  },
};

export type Strings = (typeof STRINGS)["en"];
export const t = (lang: Lang): Strings => STRINGS[lang] as Strings;

const KEY = "freshcast:lang";
export const loadLang = (): Lang => (typeof window !== "undefined" && localStorage.getItem(KEY) === "es" ? "es" : "en");
export const saveLang = (l: Lang) => localStorage.setItem(KEY, l);
