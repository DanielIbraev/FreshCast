"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StoreProvider, useStore } from "@/lib/store";
import { dailyTotals, summarize } from "@/lib/history";
import { runAblation, runBacktest, VersionResult } from "@/lib/backtest";
import { DEMO_INGREDIENTS } from "@/lib/demo-data";
import { TitleSlide, HookSlide, ProblemSlide, CompetitionSlide, DemoSlide } from "@/components/pitch/slides-story";
import { HowSlide, AccuracySlide, ResultsSlide, ScaleSlide, HonestSlide, KiroSlide } from "@/components/pitch/slides-proof";

// Slides render at 1600x900 and scale to the screen, so layout is identical
// on a laptop and a projector.
const W = 1600;
const H = 900;

function Deck() {
  const { observations, ingredients } = useStore();
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);
  const [bench, setBench] = useState<{ versions: VersionResult[]; ceiling: number } | null>(null);
  const sum = useMemo(() => summarize(dailyTotals(observations, ingredients)), [observations, ingredients]);

  useEffect(() => {
    const t = setTimeout(() => {
      const weeks = runBacktest(DEMO_INGREDIENTS, 12, 7).weeks;
      setBench({ versions: runAblation(DEMO_INGREDIENTS), ceiling: weeks.slice(2).reduce((s, w) => s + w.ceiling, 0) / (weeks.length - 2) });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const slides = [
    <TitleSlide key="t" />,
    <HookSlide key="h" />,
    <ProblemSlide key="p" monthlyBefore={sum.monthlyBefore} />,
    <CompetitionSlide key="c" />,
    <DemoSlide key="d" />,
    <HowSlide key="w" />,
    <AccuracySlide key="a" versions={bench?.versions ?? null} ceiling={bench?.ceiling ?? 0.9} />,
    <ResultsSlide key="r" sum={sum} />,
    <ScaleSlide key="s" sum={sum} />,
    <HonestSlide key="o" />,
    <KiroSlide key="k" />,
  ];
  const go = useCallback((d: number) => setI((x) => Math.min(slides.length - 1, Math.max(0, x + d))), [slides.length]);

  // /pitch?s=7 opens slide 7 (handy for jumping back after the live demo)
  useEffect(() => {
    const s = Number(new URLSearchParams(window.location.search).get("s"));
    if (s >= 1) setI(s - 1);
  }, []);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    const key = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) go(1);
      else if (["ArrowLeft", "PageUp"].includes(e.key)) go(-1);
      else if (e.key === "Home") setI(0);
      else if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", key);
    };
  }, [go]);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-canvas">
      <div style={{ width: W, height: H, transform: `scale(${scale})` }} className="relative shrink-0 px-[120px] py-[90px]" onClick={() => go(1)}>
        <AnimatePresence mode="wait">
          <motion.div key={i} className="h-full" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            {slides[i]}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-10 left-[120px] right-[120px] flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-1 gap-1.5">
            {slides.map((_, n) => (
              <button key={n} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${n <= i ? "bg-good" : "bg-border"}`} />
            ))}
          </div>
          <span className="text-sm tabular-nums text-text-muted">
            {i + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PitchPage() {
  return (
    <StoreProvider>
      <Deck />
    </StoreProvider>
  );
}
