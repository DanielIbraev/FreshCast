# FreshCast

[![Tests](https://github.com/DanielIbraev/FreshCast/actions/workflows/test.yml/badge.svg)](https://github.com/DanielIbraev/FreshCast/actions/workflows/test.yml) · **Live:** [freshcast-taupe.vercel.app](https://freshcast-taupe.vercel.app)

**Prep less. Waste less.** FreshCast tells independent restaurants how much less food to prep each morning, so less is bought, cooked, and thrown out. There's no hardware: it reads live weather, reservations, and the calendar, and learns each kitchen from a one-minute log at close. Built solo at Hackachusetts 2026 (Climate Tech).

## Why it matters
- If food waste were a country, it would be the 3rd biggest emitter on Earth (FAO).
- Food is the #1 material in US landfills, where it rots into methane (EPA).
- Up to 10% of the food a restaurant buys ends up in the trash (Galley Solutions).

For one restaurant, the demo kitchen's last 30 days annualize to **~1,940 meals** of food not wasted and **~4.0 t CO₂e** avoided. At 1% of the 412,498 US independent restaurants (Technomic, 2025), that's about **3,600 cars' worth of emissions a year**.

## The app
| Screen | What it does |
|---|---|
| Forecast | A 7-day outlook with live local weather (Open-Meteo), plus a climate-impact card (meals, kg, CO₂e, miles). Waste forecast per ingredient, plus a breakdown of every signal and the equation behind each number. What-if controls for guests, weather, and nearby events. |
| Prep & order | Usual vs. recommended prep per item, and a copy-paste list for the supplier |
| Log waste | Tap the item, then a portion ("a bowl", "half a pan"). No scale. **English / Español.** Close out with tonight's guest count. |
| Kitchen | Add, edit, or remove ingredients. The CO₂ factor fills in from the category. One-tap staples. Upload a Square/Toast sales CSV to learn guests by weekday (parsed in the browser; the file never leaves the device). |
| Setup (`/setup`) | Any restaurant in about 2 minutes: name, address (geocoded for local weather), cuisine, guests, and starter ingredients. |
| Pilot (`/pilot`) | Sign-up for pilot restaurants, linked by the QR code on the last slide. |
| Model accuracy | Every model version scored walk-forward, effort vs. accuracy, and accuracy on the stored logs |
| `/pitch` | The pitch deck, live-wired to the same data. Press F for full screen. `?cut=video&cam=1` is the recording version with a webcam-safe corner. |

## Confidence ranges (spec-driven)
Every forecast shows an 80% range learned from the kitchen's own past errors (`lib/uncertainty.ts`). On the benchmark, real nights land inside it 79.6% of the time. Spec: `.kiro/specs/forecast-confidence/`.

## How the model works
1. **Priors** (`lib/prediction.ts`): waste = daily prep × 8% × multipliers for guests, weather, weekday, season, holidays, nearby events, and cuisine.
2. **Learning** (`lib/learning.ts`): each night, ratio = actual waste ÷ prior. Corrections are shrunk means, c = (Σr + k)/(n + k), fitted per ingredient, per weekday, and per weather type. The close-out uses the real guest count, so a busy walk-in night isn't learned as a kitchen habit.
3. **Plan**: cut 63% of the forecast waste from prep and keep the rest as a buffer.

No LLM touches the numbers.

## Accuracy
Accuracy = 1 − weighted absolute percentage error. It's scored walk-forward on weeks 3–12 across 5 simulated kitchens whose true habits are hidden from the model. Regenerate with `npm run bench`.

| | Accuracy |
|---|---|
| Rule of thumb (8% of prep) | 64.0% |
| Owner's best guess (remembers the last 4 same weekdays) | 78.5% |
| FreshCast, priors only (no logging) | 78.1% |
| **FreshCast, 1-minute nightly log + guests served** | **86.7%** (38% fewer misses than the owner) |
| Best possible at 8am | 88.1% |

Weighing every item on a scale instead of eyeballing takes about 3x the time and adds 0.4 points.

## What's real vs. simulated
- **Real:** the prediction engine, learning layer, live weather, Supabase storage (Postgres with row-level security), and the benchmark code.
- **Simulated:** Marco's Trattoria and its 12 weeks of history, the benchmark kitchens, and guest counts (fixed by weekday).
- **Next:** Toast/Square and OpenTable integrations, then 3 Boston pilots.

## Security
- **Public visitors can't change the demo.** Postgres row-level security lets anyone read Marco's data. Writes require an `x-admin-token` header, checked by a `SECURITY DEFINER` function against a token in a schema the API never exposes (`supabase/security.sql`). A visitor's edits stay in their own browser.
- **Pilot sign-ups are insert-only.** Anyone can submit; only the owner can read them. Inputs are length-checked in the database, and there's a honeypot field for bots.
- **Hardened app.** Next.js 15.5.28 patches the critical Next 14 advisories. Security headers are set (HSTS, nosniff, frame-deny, referrer, permissions). API routes validate and clamp their inputs.
- **No secrets in the repo or bundle.** The admin token lives only in the database and in the owner's browser, and it's stripped from the address bar on first use.

## Tests
`npm test` runs 35 tests, including **11 property-based tests** (fast-check) that check model safety, no data leakage, shrinkage, range bounds, and importer robustness on hundreds of generated inputs each. PBT caught 2 real bugs (see [KIRO.md](KIRO.md)). The tests run in GitHub Actions on every push.

## Built with Kiro
Full write-up: **[KIRO.md](KIRO.md)**. Submission text: [SUBMISSION.md](SUBMISSION.md).

- **Spec** (`.kiro/specs/forecast-confidence/`): requirements → design with correctness properties → tasks.
- **Steering** (`.kiro/steering/`): rules for the model, UI, pitch, and hackathon scope, plus the [Anti-AI-UI](https://github.com/Vanszs/Anti-AI-UI) design suite (MIT, © Vanszs).
- **Hooks:** auto-commit-and-push on save, tests on model edits, and an automatic model re-score.
- **MCP:** `pptx-mcp` generated the backup PowerPoint.
- **Research:** every stat and the competitor teardown came from Kiro's web search.

## Run it
```bash
cd freshcast-app
npm install
npm run dev        # http://localhost:3000
npm run bench      # re-score the model after changes
```
Database: run `freshcast-app/supabase/schema.sql` in the Supabase SQL Editor, then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `freshcast-app/.env.local`. Without a database, the app saves to the browser.

## Data and credits
Open-Meteo (weather, CC BY 4.0) · OpenStreetMap Nominatim (geocoding, © OpenStreetMap contributors, ODbL) · FAO / WRAP carbon factors · USDA (1.2 lb per meal) · EPA (CO₂e per mile) · Technomic (restaurant counts). UI steering from Anti-AI-UI (MIT).
