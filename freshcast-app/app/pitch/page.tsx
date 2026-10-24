"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize } from "lucide-react";
import { StoreProvider, useStore } from "@/lib/store";
import { dailyTotals, summarize } from "@/lib/history";
import { parseLocalDate } from "@/lib/demo-data";
import bench from "@/lib/benchmarks.json";
import { S0Brand, S1Hook, S2Country, S3Guess, S4Solution, S5Loop, S6Demo } from "@/components/pitch/deck-story";
import { S7Proof, S7bTrust, S8Impact, S9Scale, S10Audience, S11Business, S12Competition, S12bKiro, S13Team, S14Ask } from "@/components/pitch/deck-proof";

// Slides render at 1600x900 and scale to fit, so a laptop, projector, and a
// screen recording all look identical.
const W = 1600;
const H = 900;
const LB_PER_KG = 2.2046;

function Deck() {
  const { observations, ingredients, week } = useStore();
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);
  const [presenting, setPresenting] = useState(false);
  const [idle, setIdle] = useState(false);
  // cam: shrink slides toward the top-right so a webcam fits bottom-left.
  // video: the recorded cut (Higgsfield intro replaces the hook, a screen
  // recording replaces the demo slide).
  const [cam, setCam] = useState(false);
  const [videoCut, setVideoCut] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sum = useMemo(() => summarize(dailyTotals(observations, ingredients)), [observations, ingredients]);
  // Annualized from the last 30 days of provable savings, same as the dashboard.
  const kgYear = (sum.kgLast30 * 365) / 30;
  const co2Year = (sum.co2Last30 * 365) / 30 / 1000;
  const meals = (kgYear * LB_PER_KG) / 1.2;
  const savedMonthly = (sum.savedLast30 * 365) / 30 / 12;
  const owner = bench.owner;
  const us = bench.effort.find((e) => e.id === "all-pos")!.accuracy;

  const tomorrow = week[0];
  const prepRows = (tomorrow?.ingredients ?? []).slice(0, 4).map((p) => ({ name: p.ingredient.name, usual: p.usualPrepKg, rec: p.recommendedPrepKg }));
  const day = tomorrow ? parseLocalDate(tomorrow.date).toLocaleDateString("en-US", { weekday: "long" }) : "Tomorrow";

  const all = [
    <S1Hook key={1} />,
    <S2Country key={2} />,
    <S3Guess key={3} />,
    <S4Solution key={4} rows={prepRows} day={day} />,
    <S5Loop key={5} />,
    <S6Demo key={6} />,
    <S7Proof key={7} owner={owner} us={us} />,
    <S7bTrust key={70} coverage={bench.coverage80} />,
    <S8Impact key={8} kgYear={kgYear} co2Year={co2Year} meals={meals} />,
    <S9Scale key={9} co2Year={co2Year} meals={meals} />,
    <S10Audience key={10} />,
    <S11Business key={11} saved={savedMonthly} />,
    <S12Competition key={12} />,
    <S12bKiro key={120} />,
    <S13Team key={13} />,
    <S14Ask key={14} />,
  ];
  // Video cut: brand frame, then problem → ask, without the hook or demo cue.
  const slides = videoCut ? [<S0Brand key={0} />, ...all.filter((_, n) => n !== 0 && n !== 5)] : all;
  const go = useCallback((d: number) => setI((x) => Math.min(slides.length - 1, Math.max(0, x + d))), [slides.length]);

  const togglePresent = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = Number(q.get("s"));
    if (s >= 1) setI(s - 1);
    setCam(q.get("cam") === "1");
    setVideoCut(q.get("cut") === "video");
    const onFs = () => setPresenting(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    const key = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown", "Enter"].includes(e.key)) go(1);
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) go(-1);
      else if (e.key === "Home") setI(0);
      else if (e.key.toLowerCase() === "f") togglePresent();
      else if (e.key.toLowerCase() === "c") setCam((c) => !c);
      else return;
      e.preventDefault();
    };
    // Hide the cursor and controls after 1.5s of no mouse movement.
    const move = () => {
      setIdle(false);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), 1500);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("mousemove", move);
    move();
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", key);
      window.removeEventListener("mousemove", move);
    };
  }, [go, togglePresent]);

  const chrome = !presenting || !idle;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-canvas" style={{ cursor: presenting && idle ? "none" : "default" }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})` }} className="relative shrink-0 px-[110px] py-[90px]" onClick={() => go(1)}>
        <div className="h-full" style={cam ? { transform: "scale(0.8)", transformOrigin: "top right" } : undefined}>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="relative h-full"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {slides[i]}
          </motion.div>
        </AnimatePresence>
        </div>
        {cam && (
          // Webcam frame: 230px circle, 40px from the left and bottom edges of the 1600x900 slide.
          <div className="pointer-events-none absolute bottom-[40px] left-[40px] h-[230px] w-[230px] rounded-full border-[3px] border-good/70" />
        )}
        {!presenting && (
          <div className="absolute bottom-8 left-[110px] right-[110px] flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {slides.map((_, n) => (
              <button key={n} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} className={`h-1 flex-1 rounded-full ${n <= i ? "bg-good" : "bg-border"}`} />
            ))}
          </div>
        )}
      </div>
      {chrome && (
        <button
          onClick={togglePresent}
          className="fixed right-5 top-5 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          <Maximize className="h-3.5 w-3.5" />
          {presenting ? "Exit (F)" : "Present (F)"}
          <span className="text-text-muted">· {i + 1}/{slides.length}</span>
        </button>
      )}
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
