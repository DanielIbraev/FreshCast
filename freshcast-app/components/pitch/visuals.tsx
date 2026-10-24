"use client";

// Drawn-in-code visuals for the deck. One visual per slide, no stock photos.
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

// 10 crates of food arrive; the last one drops into the bin beside them.
export function Crates() {
  return (
    <div className="flex h-[150px] items-start gap-5">
      {Array.from({ length: 10 }, (_, i) => {
        const lost = i === 9;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -30 }}
            animate={lost ? { opacity: [0, 1, 1, 0], y: [-30, 0, 0, 70], x: [0, 0, 0, 108], rotate: [0, 0, 0, 18], scale: [1, 1, 1, 0.6] } : { opacity: 1, y: 0 }}
            transition={lost ? { duration: 2.0, times: [0, 0.2, 0.55, 1], delay: 0.6, ease } : { duration: 0.4, delay: i * 0.05, ease }}
            className="flex h-[88px] w-[88px] flex-col justify-between rounded-lg border-2 p-2"
            style={{ borderColor: lost ? "#EF4444" : "#2D3748", background: lost ? "#EF44441A" : "#1A1D27" }}
          >
            <div className="h-1.5 rounded-full" style={{ background: lost ? "#EF4444" : "#3B4A61" }} />
            <div className="h-1.5 rounded-full" style={{ background: lost ? "#EF4444" : "#3B4A61" }} />
            <div className="h-1.5 rounded-full" style={{ background: lost ? "#EF4444" : "#3B4A61" }} />
          </motion.div>
        );
      })}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="ml-2 self-end">
        <Trash2 className="h-[120px] w-[120px] text-waste" strokeWidth={1.4} />
      </motion.div>
    </div>
  );
}

// FAO: food waste would rank third among the world's emitters.
export function Podium() {
  const bars = [
    { label: "China", h: 420, c: "#3B4A61", rank: "1" },
    { label: "United States", h: 205, c: "#3B4A61", rank: "2" },
    { label: "Food waste", h: 130, c: "#EF4444", rank: "3" },
  ];
  return (
    <div className="flex items-end gap-10">
      {bars.map((b, i) => (
        <div key={b.label} className="flex w-[260px] flex-col items-center">
          <span className={`mb-4 font-display text-[30px] font-700 ${i === 2 ? "text-waste" : "text-text-secondary"}`}>{b.label}</span>
          <motion.div
            className="flex w-full items-start justify-center rounded-t-lg pt-4 font-display text-5xl font-800"
            style={{ background: b.c, color: i === 2 ? "#0F1117" : "#94A3B8" }}
            initial={{ height: 0 }}
            animate={{ height: b.h }}
            transition={{ duration: 0.9, delay: i * 0.25, ease }}
          >
            {b.rank}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

// What the cook sees at 6am.
export function PrepCard({ rows, day }: { rows: { name: string; usual: number; rec: number }[]; day: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="w-[560px] rounded-2xl border border-border bg-surface p-8">
      <p className="text-lg text-text-muted">Prep list · {day}</p>
      <ul className="mt-6 space-y-5">
        {rows.map((r, i) => (
          <motion.li key={r.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12, ease }} className="flex items-center justify-between text-2xl">
            <span className="text-text-primary">{r.name}</span>
            <span className="tabular-nums">
              <span className="text-text-muted line-through">{r.usual}kg</span>
              <span className="ml-4 font-700 text-good">{r.rec.toFixed(1)}kg</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// The daily loop: forecast in the morning, one-minute log at night.
// The daily loop, shown with real screenshots of the app (public/deck, captured
// from the running app), not icons.
export function Loop() {
  const steps = [
    { src: "/deck/forecast.webp", t: "6 AM", d: "Forecast for every ingredient", alt: "FreshCast forecast screen: a week of waste forecasts and per-ingredient bars" },
    { src: "/deck/prep.webp", t: "Before service", d: "A smaller prep list", alt: "Prep and order list: usual prep crossed out, recommended prep in green" },
    { src: "/deck/log.webp", t: "Close", d: "Two taps per item in the bin", alt: "Log waste screen: ingredient tiles, today's log and the close-out" },
  ];
  return (
    <div className="grid grid-cols-3 gap-8">
      {steps.map((s, i) => (
        <motion.figure key={s.t} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.25, duration: 0.45, ease }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt={s.alt} className="aspect-[4/3] w-full rounded-xl border border-border object-cover object-top" />
          <figcaption className="mt-5">
            <p className="font-display text-[30px] font-700 text-text-primary">{s.t}</p>
            <p className="mt-1 text-[22px] text-text-secondary">{s.d}</p>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

// 2x2 positioning: hardware vs. software, after the bin vs. before prep.
export function Matrix() {
  const dot = (label: string, x: number, y: number, us = false, delay = 0) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ease }}
      className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={`mx-auto rounded-full ${us ? "h-8 w-8 bg-good" : "h-5 w-5 bg-text-muted"}`} />
      <p className={`mt-3 whitespace-nowrap ${us ? "font-display text-3xl font-700 text-good" : "text-xl text-text-secondary"}`}>{label}</p>
    </motion.div>
  );
  return (
    <div className="relative h-[520px] w-[900px]">
      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
      <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-lg text-text-muted">Needs hardware</span>
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-lg text-text-muted">Software only</span>
      <span className="absolute -left-4 top-1/2 -translate-x-full -translate-y-1/2 text-right text-lg text-text-muted">Measures waste<br />after the bin</span>
      <span className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full text-lg text-text-muted">Prevents it<br />before prep</span>
      {dot("Camera trackers", 22, 22, false, 0.1)}
      {dot("Smart scales", 38, 36, false, 0.2)}
      {dot("Spreadsheets & gut feel", 28, 74, false, 0.4)}
      {dot("FreshCast", 76, 74, true, 0.7)}
    </div>
  );
}
