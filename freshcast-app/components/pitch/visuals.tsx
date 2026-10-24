"use client";

// Drawn-in-code visuals for the deck. One visual per slide, no stock photos.
import { motion } from "framer-motion";
import { ArrowRight, Moon, Sun, Trash2, Utensils } from "lucide-react";

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
    { label: "United States", h: 190, c: "#3B4A61", rank: "2" },
    { label: "Food waste", h: 140, c: "#EF4444", rank: "3" },
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
export function Loop() {
  const steps = [
    { icon: Sun, t: "6 AM", d: "Forecast + prep list" },
    { icon: Utensils, t: "Service", d: "Cook as normal" },
    { icon: Moon, t: "Close", d: "1-minute bin log" },
  ];
  return (
    <div className="flex items-center gap-6">
      {steps.map((s, i) => (
        <div key={s.t} className="flex items-center gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2, ease }} className="flex w-[250px] flex-col items-center rounded-2xl border border-border bg-surface px-6 py-8">
            <s.icon className="h-12 w-12 text-good" strokeWidth={1.75} />
            <p className="mt-5 font-display text-3xl font-700 text-text-primary">{s.t}</p>
            <p className="mt-2 text-xl text-text-secondary">{s.d}</p>
          </motion.div>
          {i < steps.length - 1 && <ArrowRight className="h-8 w-8 text-text-muted" />}
        </div>
      ))}
    </div>
  );
}

// Two bars: the owner's own best guess vs. FreshCast.
export function VersusBars({ owner, us }: { owner: number; us: number }) {
  const w = (v: number) => `${((v - 0.5) / 0.5) * 100}%`;
  const rows = [
    { label: "Owner's best guess", v: owner, c: "#3B4A61", t: "text-text-secondary" },
    { label: "FreshCast", v: us, c: "#10B981", t: "text-good" },
  ];
  return (
    <div className="w-[1000px] space-y-8">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-3 flex items-baseline justify-between">
            <span className={`text-2xl ${r.t}`}>{r.label}</span>
            <span className={`font-display text-4xl font-800 tabular-nums ${r.t}`}>{Math.round(r.v * 100)}%</span>
          </div>
          <div className="h-10 rounded-lg bg-surface">
            <motion.div className="h-full rounded-lg" style={{ background: r.c }} initial={{ width: 0 }} animate={{ width: w(r.v) }} transition={{ duration: 0.9, delay: i * 0.3, ease }} />
          </div>
        </div>
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
      {dot("Winnow", 22, 22, false, 0.1)}
      {dot("Leanpath", 34, 34, false, 0.2)}
      {dot("Orbisk", 16, 38, false, 0.3)}
      {dot("Spreadsheets & gut feel", 28, 74, false, 0.4)}
      {dot("FreshCast", 76, 74, true, 0.7)}
    </div>
  );
}

// Monthly savings vs. the subscription price.
export function SavingsBar({ saved, price }: { saved: number; price: number }) {
  return (
    <div className="w-[1000px] space-y-6">
      {[
        { l: "Food he no longer throws out", v: saved, c: "#10B981" },
        { l: "FreshCast", v: price, c: "#3B4A61" },
      ].map((r, i) => (
        <div key={r.l} className="flex items-center gap-6">
          <span className="w-[380px] text-2xl text-text-secondary">{r.l}</span>
          <motion.div className="h-14 rounded-lg" style={{ background: r.c }} initial={{ width: 0 }} animate={{ width: `${(r.v / saved) * 520}px` }} transition={{ duration: 0.9, delay: i * 0.3, ease }} />
          <span className="font-display text-4xl font-800 tabular-nums text-text-primary">${Math.round(r.v)}<span className="text-xl text-text-muted">/mo</span></span>
        </div>
      ))}
    </div>
  );
}
