"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { CuisineType } from "@/lib/types";
import { AutoField, Draft, Errors, PlaceResult, buildIngredients, buildProfile, emptyDraft, fromPlace, stapleRows, validate } from "@/components/setup/draft";
import { STEPS, Stepper } from "@/components/setup/stepper";
import { SearchState, StepFind, emptySearch } from "@/components/setup/step-find";
import { StepDetails } from "@/components/setup/step-details";
import { StepBusy } from "@/components/setup/step-busy";
import { StepPrep } from "@/components/setup/step-prep";
import { StepReview } from "@/components/setup/step-review";

const INTRO = [
  "Takes a few minutes, once. After that the only daily work is about a minute at close.",
  "Check what we filled in. Change anything that's off.",
  "Roughly how many guests you see on a normal open day.",
  "Starter list for your cuisine. You can edit or add items any time in Kitchen.",
  "One last look before we build your first forecast.",
];

export default function SetupPage() {
  const { startOwnRestaurant } = useStore();
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState<Draft>(emptyDraft);
  const [search, setSearch] = useState<SearchState>(emptySearch);
  const [errors, setErrors] = useState<Errors>({});
  const [creating, setCreating] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const reduce = useReducedMotion();

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [step, reduce]);

  function go(to: number) {
    setDir(to > step ? 1 : -1);
    setErrors({});
    setStep(to);
    setReached((r) => Math.max(r, to));
  }

  function next() {
    const e = validate(step, d);
    setErrors(e);
    if (Object.keys(e).length) return;
    go(step + 1);
  }

  function update(patch: Partial<Draft>, touched?: AutoField) {
    setD((x) => ({ ...x, ...patch, auto: touched ? x.auto.filter((f) => f !== touched) : x.auto }));
  }

  function setCuisine(c: CuisineType) {
    setD((x) => (x.cuisineType === c ? x : { ...x, cuisineType: c, rows: [...stapleRows(c), ...x.rows.filter((r) => r.custom)], auto: x.auto.filter((f) => f !== "cuisine") }));
  }

  function pick(p: PlaceResult) {
    setD((x) => fromPlace(x, p));
    go(1);
  }

  function manual() {
    setD((x) => (x.auto.length ? { ...emptyDraft(), name: search.q.trim() } : { ...x, name: x.name || search.q.trim() }));
    go(1);
  }

  function create() {
    for (const s of [1, 2, 3]) {
      const e = validate(s, d);
      if (Object.keys(e).length) {
        go(s);
        setErrors(e);
        return;
      }
    }
    setCreating(true);
    startOwnRestaurant(buildProfile(d), buildIngredients(d));
  }

  const offset = reduce ? 0 : 16;
  const last = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-10">
      <header>
        <p className="text-sm text-text-muted">Set up your restaurant</p>
        <h1 ref={heading} tabIndex={-1} className="font-display text-[28px] font-700 leading-tight text-text-primary focus:outline-none">
          {STEPS[step]}
        </h1>
        <p className="mt-1 max-w-prose text-sm text-text-secondary">{INTRO[step]}</p>
      </header>

      <Stepper current={step} reached={reached} onJump={go} />

      <Card className="overflow-hidden p-5 sm:p-6">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * offset }}
            transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
          >
            {step === 0 && <StepFind search={search} setSearch={setSearch} onPick={pick} onManual={manual} />}
            {step === 1 && <StepDetails d={d} errors={errors} update={update} setCuisine={setCuisine} />}
            {step === 2 && <StepBusy d={d} errors={errors} update={update} />}
            {step === 3 && <StepPrep d={d} errors={errors} setRows={(rows) => update({ rows })} />}
            {step === 4 && <StepReview d={d} goTo={go} />}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors duration-150 hover:border-text-muted hover:text-text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </button>
        ) : (
          <p className="text-xs text-text-muted">Saved on this device only. Nothing is shared.</p>
        )}

        {step === 0 ? (
          // The search results and the "isn't listed" card are the ways forward;
          // after coming back here, this keeps what was already filled in.
          reached > 0 && (
            <button type="button" onClick={() => go(1)} className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-good px-4 py-2 text-sm font-600 text-good transition-colors duration-150 hover:bg-good/10">
              Back to details <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )
        ) : last ? (
          <button type="button" onClick={create} disabled={creating} className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-good px-5 py-2.5 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim disabled:cursor-wait disabled:opacity-70">
            {creating && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
            {creating ? "Building your forecast" : `Create ${d.name.trim() || "restaurant"}`}
          </button>
        ) : (
          <button type="button" onClick={next} className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-good px-5 py-2.5 text-sm font-600 text-canvas transition-colors duration-150 hover:bg-good-dim">
            Next: {STEPS[step + 1]} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
