// Closing slides: Kiro, team, try it.
import { QRCodeSVG } from "qrcode.react";
import { Line } from "./deck-story";
import { Mark } from "@/components/brand/mark";
import { SITE_URL } from "@/lib/site";
import bench from "@/lib/benchmarks.json";

// Test counts are the one number the deck can't read at runtime. Update both
// from `npx vitest run` whenever tests are added (62 passed, 13 properties P1–P13).
export const TESTS = 62;
export const PROPERTIES = 13;

const marcoCoverage = Math.round(bench.byRestaurant["marcos-trattoria"].coverage80 * 100);

// Implementation: Kiro did all of it. No brand names besides Kiro on screen
// (the video rules ban third-party trademarks).
export const S12bKiro = () => {
  const tiles: [string, string, string][] = [
    ["Plan", "Idea, research, sourced stats", "Web search inside Kiro, 7 steering docs"],
    ["Spec", "Requirements → design → tasks", `Confidence ranges: 73% → ${marcoCoverage}% coverage`],
    ["Build", "Every line of code", `Model, app, database, ${TESTS} tests`],
    ["Check", `${PROPERTIES} property tests, a subagent audit`, "Found 2 bugs and 5 model errors"],
    ["Ship", "3 hooks, 200+ auto-pushed commits", "Tests and re-scoring on every save"],
    ["Pitch", "This deck and the video plan", "Design skill checked every slide"],
  ];
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-6">
        <span className="rounded-xl border-2 border-text-primary px-4 py-0.5 font-display text-[52px] font-700 leading-tight tracking-tight text-text-primary">Kiro</span>
        <Line>One builder. One tool. All of it.</Line>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {tiles.map(([h, a, b]) => (
          <div key={h} className="rounded-2xl border border-border bg-surface p-8">
            <p className="font-display text-[36px] font-700 text-good">{h}</p>
            <p className="mt-3 text-[24px] leading-snug text-text-primary">{a}</p>
            <p className="mt-2 text-[20px] leading-snug text-text-muted">{b}</p>
          </div>
        ))}
      </div>
      <p className="text-[24px] text-text-secondary">No second chatbot for ideas, no other coding assistant. Planning, code, tests, docs and this deck were all done in Kiro.</p>
    </div>
  );
};

export const S13Team = () => (
  <div className="flex h-full items-center gap-20">
    <div className="flex h-[360px] w-[360px] shrink-0 items-center justify-center rounded-3xl border border-border bg-surface">
      <span className="font-display text-[140px] font-800 text-good">DI</span>
    </div>
    <div>
      <p className="font-display text-[64px] font-700 leading-tight text-text-primary">Daniel Ibraev</p>
      <ul className="mt-8 space-y-5 text-[30px] leading-snug text-text-secondary">
        <li>Worked at a small cafe. Watched the bin fill up every night.</li>
        <li>Built FreshCast end to end at this hackathon: model, app, database.</li>
        <li>Next: run it in a real kitchen and measure it against a scale.</li>
      </ul>
      <p className="mt-10 flex items-center gap-3 text-[22px] text-text-muted">
        <span className="rounded-md border border-border px-2.5 py-1 font-display text-[20px] font-700 text-text-primary">Kiro</span>
        Built solo, entirely in Kiro: plan, code, tests, docs and this deck.
      </p>
    </div>
  </div>
);

// Closing card: where judges can test it. The rules require a working link.
export const S14Try = () => (
  <div className="flex h-full items-center justify-between gap-16">
    <div className="max-w-[820px]">
      <div className="mb-10 flex items-center gap-4">
        <Mark size={56} />
        <span className="font-display text-4xl font-700 text-text-primary">FreshCast</span>
      </div>
      <h2 className="font-display text-[84px] font-700 leading-[1.02] tracking-tight text-text-primary">Try it on your phone.</h2>
      <p className="mt-8 text-[30px] leading-snug text-text-secondary">No login. Switch between the three demo kitchens, or set up any restaurant from a map search.</p>
      <dl className="mt-12 grid grid-cols-[150px_1fr] gap-y-3 text-[24px]">
        <dt className="text-text-muted">Live app</dt>
        <dd className="text-text-primary">{SITE_URL.replace("https://", "")}</dd>
        <dt className="text-text-muted">Code</dt>
        <dd className="text-text-primary">github.com/DanielIbraev/FreshCast</dd>
        <dt className="text-text-muted">Track</dt>
        <dd className="text-text-primary">Climate Tech</dd>
      </dl>
    </div>
    <div className="shrink-0 rounded-2xl bg-white p-6">
      <QRCodeSVG value={`${SITE_URL}/dashboard`} size={320} level="M" bgColor="#FFFFFF" fgColor="#0F1117" />
    </div>
  </div>
);
