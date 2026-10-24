# How FreshCast was built with Kiro

FreshCast was built solo during Hackachusetts 2026 in the **Kiro IDE**. Kiro wrote most of the code, tests and docs, ran the research, and diagnosed deploy and CI failures. I made the product decisions, reviewed every screen, and pushed back when a number or claim didn't hold up. Everything below can be checked in this repo: the `.kiro/` folder and the git history (over 270 commits, most of them from the auto-commit hook).

## One tool for everything
Kiro was the only AI tool used to plan and build FreshCast. No separate chatbot for brainstorming, no other coding assistant, no other writing tool. In Kiro:
- **Ideas and research:** choosing the problem, comparing competitors, and sourcing every statistic with Kiro's web search.
- **Planning:** the battle plan, the steering files and the spec.
- **Building:** every line of code, the database schema and security policies, 62 tests, the benchmark, and the script that fetches Boston's recorded weather for it.
- **Checking:** property-based tests, a subagent audit of the model's math and sources, and the Hallmark design checker run against the live app.
- **Shipping:** hooks for commits, tests and re-scoring; diagnosing CI and deploy failures.
- **Pitching:** the deck at `/pitch` (a page in the app, wired to the same data), the demo script, the submission text and this write-up. Kiro also wrote the shot list and prompts for the 10-second intro clip; the clip itself was rendered by a separate video-generation tool, the one step Kiro can't do.

## Kiro tools used: IDE only
- **Kiro IDE** was the only Kiro surface used. I did not use Kiro CLI, Kiro Web or Kiro Crew, so I can't compare them from experience. As one person working in one editor, I had no handoffs or separate machines that would have needed them.
- Inside the IDE, these parts did different jobs:
  - **The agent chat** (mostly Autopilot) built features end to end: code, tests, shell commands, screenshots of the running app for review.
  - **Subagents** ran in parallel on separate tasks while the main session kept building (details below).
  - **Spec mode** for the one feature where correctness was the product.
  - **Hooks, steering, a workspace skill and an MCP server**, each covered below.
  - **Built-in web search and fetch** sourced every statistic (FAO, EPA, Feeding America, Technomic, Galley Solutions, Our World in Data) and checked vendor docs (Vercel, Supabase, Open-Meteo, the Nominatim usage policy) instead of guessing.

## Subagents
Kiro dispatched subagents in parallel for:
1. The setup wizard (`/setup`): OpenStreetMap search that fills in name, address, cuisine and opening hours, plus an opening-hours parser with its own property tests.
2. The per-restaurant Model accuracy page (`lib/track-record.ts`, `components/model/`).
3. The page-entrance animation (holds until data is ready, respects reduced motion).
4. **A math and sources audit of the model.**
5. These docs, checked line by line against the code.

A later batch ran three subagents at once on separate parts of the app:
- The front page (`/`, `components/landing/`) and the README screenshots in `docs/screenshots/`.
- The kitchen screen (`/screen`, `components/screen/`): a big-type prep list for a wall tablet, English and Español, tap to mark done.
- The Model page's "What would improve accuracy" (`buildActions` in `lib/track-record.ts`): specific findings from each kitchen's close-outs instead of generic tips, plus the day-1 milestone view.

A final subagent pass updated these docs against the code and re-ran the impact numbers.

The audit was the most valuable. It found real problems, and each was fixed in code:
- **Closed days were forecast with maximum waste.** Closed days now have no forecast, no prep cut and no savings (property P12), and the simulator produces no rows for them.
- **All demo restaurants shared one history.** Each restaurant now has its own menu, hidden habits, weather and simulated history (`lib/kitchens.ts`).
- **Savings counted sold-out nights.** If the plan cut prep and an item logged 0, the cut wasn't provably waste. Those nights now count $0 saved and are excluded from scoring and ranges (P13).
- **The guest signal claimed a reservation integration that didn't exist.** It now says what it is: the restaurant's usual guests for that weekday, a what-if slider, and guests served entered at close-out.
- **CO₂ factors were mis-sourced.** They now come from Poore & Nemecek (2018) via Our World in Data, with the per-item mapping written in `lib/kitchens.ts`.

The audit also led to removing two multipliers: a fixed industry day-of-week prior (it double-counted what weekday guest counts already capture, and pointed the wrong way for lunch spots) and a cuisine multiplier (no source).

## Spec-driven development
- **Where:** `.kiro/specs/forecast-confidence/` with `requirements.md`, `design.md` and `tasks.md`.
- **Why a spec here and not everywhere:** most of the app was vibe-coded quickly with steering as guardrails. I switched to a spec for 80% confidence ranges on every forecast, because a range that looks right but is wrong is worse than no range.
- **How it is structured:**
  - **Requirements** in EARS form ("WHEN … THE SYSTEM SHALL …"), with user stories for the owner and for a skeptical technical reviewer. Req 3 demands proof: measured coverage of the range, and a test that fails if coverage leaves 70–90%.
  - **Design** includes a table of correctness properties, each a requirement restated for all inputs, so they could become property-based tests.
  - **Tasks** reference requirement numbers. Task 1 was to write the properties against the existing code before building anything new.
- **How it compared with vibe coding:**
  - The properties found 2 bugs before any new code existed (see below).
  - The first range design measured only **73.4%** coverage on a nominal 80%. Errors were being measured against a forecast rebuilt with the guest count known only at close, which the kitchen never saw in the morning. The fix was to measure errors against the morning forecast, recovered from the stored prep cut (cut = forecast × 0.63). Coverage is now **79.1%** for Marco's, 77.5% for Golden Crumb and 79.9% for Kendall. (Before the benchmark moved to real recorded weather it was 80.7%, 79.6% and 82.0%. On real weather the ranges came out slightly narrow. The spec's test still requires 70–90%.)
  - Vibe coding would have shipped the 73% version, because it looked fine on screen.

## Agent hooks (`.kiro/hooks/`)
| Hook file | Trigger | Matcher | What it does |
|---|---|---|---|
| `auto-commit-push.json` | PostFileSave | any file | `git add -A`, commit as "auto: save HH:MM:SS", push to `main`. The commit history is a timeline of the build. |
| `test-on-model-save.json` | PostFileSave | `freshcast-app/(lib\|tests)/.*\.ts$` | Runs the Vitest suite (dot reporter, 120 s timeout), so a model edit can't quietly break a claim in the pitch. |
| `rescore-model.json` | PostFileSave | `freshcast-app/lib/(prediction\|learning\|sim\|effort\|backtest\|uncertainty)\.ts$` | Runs `npm run bench` (180 s timeout), which rewrites `lib/benchmarks.json`. The Model page and the deck read that file, so their accuracy numbers can't go stale. |

- **Tried and removed:** a PreToolUse `secret-guard` script that blocked any agent write containing the admin token or a Supabase service key. It is not active. Secrets are kept out by `.gitignore` (`.env.local`, `*.secret`, `*.local.sql`) and by never needing a server secret in the app.
- **A strategic decision the hooks forced:** pushing on every save produced well over 100 commits a day, and each one triggered a Vercel deploy. That hit Vercel's limit of 100 deployments per day. Kiro found it from the failing GitHub check and confirmed in Vercel's docs that skipped builds still count. The fix was to turn off git deploys (`"git": { "deploymentEnabled": false }` in `freshcast-app/vercel.json`) and deploy through a Vercel deploy hook when a version is ready. GitHub still gets every change; production deploys happen on purpose.
- The same session fixed a CI failure: tests passed locally but timed out on slower GitHub runners, so the test timeout was raised.

## Steering (`.kiro/steering/`, 7 files, always included)
| File | Role |
|---|---|
| `anti-ai-slop.md` | Design guardrail: a ban list of the defaults AI-generated UIs fall into (purple gradients, emoji icons, glassmorphism, hype copy, no reduced-motion). |
| `component-reference.md` | Design guardrail: the matching library of patterns to build instead. |
| `ui-ux-pro-max.md` | Design guardrail: a searchable design-system reference. |
| `ui-design.md` | FreshCast's own tokens: dark surfaces, one emerald accent, red for waste, Lucide icons, Recharts. |
| `saas-engineering.md` | Defines the engine: stack, project structure, every signal and its value, learning rules. |
| `pitch-and-demo.md` | Keeps numbers consistent: the only numbers allowed in the pitch, the demo script and Q&A. |
| `hackathon-mindset.md` | Sets priorities and scope, plus the standing rule to update docs, deck and steering in the same pass as any number change. |

The first three are from [Anti-AI-UI](https://github.com/Vanszs/Anti-AI-UI) (MIT).

**Strategy that made the biggest difference:** the rule that every number on screen must come from code, never be typed in. It forced the dashboard, impact card, Model page and deck to read from stored close-outs and `benchmarks.json`. Combined with `pitch-and-demo.md` listing the only numbers allowed, it stopped the pitch from drifting away from the app. It is also why an early "20% → 90% accuracy" claim was dropped: there was no honest source for 20%.

**Second:** pairing a ban list (anti-AI-slop) with a pattern library (component reference), so Kiro had both what to avoid and what to build. That is why the UI uses flat dark surfaces, one emerald accent, Lucide icons and real numbers instead of the usual gradient-and-emoji defaults.

## Skills (`.kiro/skills/hallmark/`)
The [Hallmark](https://github.com/nutlope/hallmark) design skill (MIT) was added as a workspace skill. Its `sloplint` script was run against the live app. It flagged low-contrast muted text, weak focus rings, labels in tracked capitals, and 4 font weights where 2–3 is the target. Some of the flagged patterns came from our own `ui-design.md` (uppercase, wide-tracked card labels), so the skill also caught a weak rule in our steering. After the latest round, sloplint was rerun on the new pages (front page, kitchen screen, the updated dashboard and Model page) and reported 0 FAILs.

## MCP (`.kiro/settings/mcp.json`)
- **`pptx-mcp`** is the one MCP server configured. It lets Kiro create and edit real PowerPoint files, and Kiro used it to generate an editable backup deck (`_reference/FreshCast-Pitch-Deck.pptx`). The live deck at `/pitch` is the current one; the backup is from an earlier draft.
- Getting it running took debugging: its `cryptography` dependency failed to build because macOS had no OpenSSL, so Kiro pinned a version with prebuilt wheels and pointed the config at the Python interpreter that had the dependencies.
- **Web search and fetch** (built into Kiro, not an MCP server) did the sourcing work: every statistic in the README, app and deck has a named source.

## Property-based testing
`freshcast-app/tests/properties.test.ts`, fast-check, 200 generated cases per property. The full suite is 62 tests (`cd freshcast-app && ./node_modules/.bin/vitest run`), and GitHub Actions runs it on every push.

| # | Property | Requirement |
|---|---|---|
| P1 | The forecast is finite and never negative | Model safety |
| P2 | More guests never means more forecast waste | Guest signal direction |
| P3 | The forecast is linear in daily prep | Units |
| P4 | The prep plan never asks for negative prep or more than usual | The plan can't tell a cook to prep more |
| P5 | Learned factors stay inside their clamps | Learning stability |
| P6 | Observations from the target day or later never change the forecast | No leakage (Req 2.4) |
| P7 | Calibration sits between 1.0 and the kitchen's mean ratio | Shrinkage |
| P8 | 0 ≤ low ≤ forecast ≤ high | Req 1.3 |
| P9 | Accuracy is in [0, 1], and exactly 1 when every forecast is right | Metric |
| P10 | Any CSV table survives write → parse | Importer |
| P11 | Every date the importer accepts is a real calendar date | Req 4.1 |
| P12 | A closed day never forecasts waste, savings or a prep cut | Added after the audit |
| P13 | Sold-out (censored) nights never feed the confidence ranges | Added after the audit |

The setup wizard's opening-hours parser has 3 more properties in `tests/opening-hours.test.ts` (never throws on any string, always returns 7 days, a single rule opens exactly the days it names).

**What PBT caught that the example tests had missed:**
- **P4:** for tiny items (around 0.1 kg of prep a day), rounding made the plan recommend *more* than the usual prep. Shrunk counterexample: prep 0.1055 kg, 109 guests, calibration 0.4. Fixed with a clamp after rounding in `lib/prediction.ts`; regression test in `tests/prediction.test.ts`.
- **P11:** the sales-CSV importer accepted **2/29/2026** (not a leap year) and rolled it into March 1, which skewed the guest pattern. Fixed with a calendar round-trip check; regression test in `tests/benchmark.test.ts`.

Both are edge cases nobody thinks to write an example test for.

## Kiro powers
None were installed or used. Supabase was set up directly with SQL (`freshcast-app/supabase/schema.sql` and `security.sql`).

## Experimentation and strategic decisions
- **Build the baseline you're claiming to beat.** Instead of claiming "beats the owner's gut", Kiro built an owner baseline (`ownerBaseline` in `lib/effort.ts`): an owner who remembers exactly what was wasted on the same weekday for the last 4 weeks. That is generous, since no owner knows those numbers without logging. FreshCast's v4 still makes 29%, 28% and 16% fewer misses than that owner for the three restaurants.
- **Effort vs. accuracy as an experiment.** Kiro replayed 6 staff-logging plans (`PLANS` in `lib/effort.ts`). For Marco's, quick-tap logging of every item plus guests served takes about 1.2 minutes a night and reaches 84.7%. Weighing every item takes about 3.5 minutes for 85.4%. The data chose quick taps as the default.
- **Real weather in the simulation.** The benchmark first ran on simulated weather. It now replays each night on Boston's recorded weather from Open-Meteo (`scripts/fetch-history-weather.ts` → `lib/history-weather.json`, last 92 days). The numbers moved a little and not in our favor: v4 dropped 0.3 to 0.5 points for each restaurant, the lead over the owner shrank for Golden Crumb and Kendall, and range coverage fell just under 80%. We kept the harder, more honest version.
- **Ablation, so every signal earns its place.** The benchmark adds signals one version at a time (v0 to v4) and scores each the same way. Signals that couldn't be sourced or that double-counted were removed (see the audit above).
- **Honest framing of the benchmark.** The simulator shares the model's structure, so the benchmark shows the learning recovers hidden habits. It does not prove real-world accuracy. The next step after the hackathon is testing in a real kitchen.
- **Security as a design decision.** The public can read the demo but not change it: Postgres row-level security plus an owner token checked by a `SECURITY DEFINER` function. Kiro also caught that `.env.local` had been committed early on (now untracked and ignored) and upgraded Next.js 14 to 15.5.28 to patch critical advisories.
