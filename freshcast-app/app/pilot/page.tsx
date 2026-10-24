"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Mark } from "@/components/brand/mark";
import { insertSignup } from "@/lib/db";

const input = "w-full rounded-md border border-border bg-canvas px-3 py-2.5 text-base text-text-primary focus:border-good focus:outline-none";
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Pilot waitlist. Anyone can add a sign-up; only the owner can read them
// (row-level security in supabase/security.sql).
export default function PilotPage() {
  const [f, setF] = useState({ name: "", restaurant: "", email: "", city: "", note: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.website) return setState("done"); // honeypot: bots fill hidden fields
    const next: Record<string, string> = {};
    if (!f.name.trim()) next.name = "Your name, please.";
    if (!f.restaurant.trim()) next.restaurant = "Which restaurant? (or the one you'd introduce)";
    if (!EMAIL.test(f.email.trim())) next.email = "That email doesn't look right.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("sending");
    const ok = await insertSignup({
      name: f.name.trim().slice(0, 80),
      restaurant: f.restaurant.trim().slice(0, 120),
      email: f.email.trim().slice(0, 254),
      city: f.city.trim().slice(0, 80) || undefined,
      note: f.note.trim().slice(0, 500) || undefined,
    }).catch(() => false);
    setState(ok ? "done" : "failed");
  }

  return (
    <main className="flex min-h-[100dvh] items-start justify-center bg-canvas px-5 py-10 sm:items-center">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Mark size={36} />
          <span className="font-display text-xl font-700 text-text-primary">FreshCast</span>
        </div>

        {state === "done" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-good">
              <Check className="h-6 w-6 text-canvas" strokeWidth={3} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-700 text-text-primary">Thank you!</h1>
            <p className="mt-3 text-text-secondary">Daniel will reach out this week to set up a pilot. Every kitchen that preps less keeps food out of a landfill.</p>
            <Link href="/dashboard" className="mt-8 inline-block text-sm text-good hover:text-text-primary">
              See the live demo →
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h1 className="font-display text-3xl font-700 leading-tight text-text-primary">Pilot FreshCast in your kitchen</h1>
            <p className="mt-3 text-text-secondary">Free for the first 3 Boston restaurants. Or introduce us to an owner you know.</p>

            <div className="mt-8 space-y-4">
              <Field label="Your name" error={errors.name}>
                <input className={input} value={f.name} onChange={set("name")} autoComplete="name" maxLength={80} />
              </Field>
              <Field label="Restaurant" error={errors.restaurant}>
                <input className={input} value={f.restaurant} onChange={set("restaurant")} autoComplete="organization" maxLength={120} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input className={input} type="email" inputMode="email" value={f.email} onChange={set("email")} autoComplete="email" maxLength={254} />
              </Field>
              <Field label="City (optional)">
                <input className={input} value={f.city} onChange={set("city")} maxLength={80} />
              </Field>
              <Field label="Anything we should know? (optional)">
                <textarea className={`${input} h-20 resize-none`} value={f.note} onChange={set("note")} maxLength={500} />
              </Field>
              <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} className="hidden" aria-hidden name="website" />
            </div>

            {state === "failed" && <p className="mt-4 text-sm text-waste">Couldn&apos;t save that. Check your connection and try again.</p>}
            <button type="submit" disabled={state === "sending"} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-good py-3 text-base font-600 text-canvas transition-colors duration-150 hover:bg-good-dim disabled:opacity-60">
              {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
              Request a pilot
            </button>
            <p className="mt-3 text-center text-xs text-text-muted">We only use your email to contact you about the pilot.</p>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-text-secondary">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-waste">{error}</span>}
    </label>
  );
}
