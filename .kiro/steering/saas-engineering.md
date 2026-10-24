# SaaS Engineering Standards — FreshCast

## Stack
- Framework: Next.js 15 App Router (TypeScript), React 19
- Styling: Tailwind CSS, own components in `components/ui/`
- Animations: Framer Motion (respect `prefers-reduced-motion`)
- Charts: Recharts
- Icons: Lucide
- Database: Supabase (Postgres + row-level security). No user accounts: the public reads the demo; the owner writes with an `x-admin-token` checked by a `SECURITY DEFINER` function (`supabase/security.sql`).
- Weather: Open-Meteo API (free, no key), by the restaurant's lat/lng
- Restaurant search and geocoding: OpenStreetMap Nominatim (follow its usage policy: descriptive User-Agent, ≤1 request/s, no autocomplete)
- Tests: Vitest + fast-check
- Deployment: Vercel, via a deploy hook. Git deploys are off (`vercel.json` → `git.deploymentEnabled: false`) because auto-push on every save hit the 100 deploys/day limit.
- No LLM, no reservation API, no events API.

## Architecture Principles
- Server Components by default. Client Components only when interactivity is needed (charts, forms, the store).
- API routes in `/app/api/` proxy external calls (Open-Meteo, Nominatim) and validate and clamp their inputs.
- Never expose secrets in client code. The only keys in the client are the public Supabase URL and anon key.
- All database access goes through `lib/db.ts` (Supabase client). If Supabase is unreachable, fall back to browser storage.

## Project Structure
```
freshcast-app/
  app/
    (app)/dashboard   → Forecast: 7-day outlook, per-ingredient forecast, signal breakdown, what-if, Apply prep plan
    (app)/orders      → Prep & order list
    (app)/log         → waste logging (English/Español) and close-out
    (app)/kitchen     → ingredients, staples, sales-CSV import for guests by weekday
    (app)/model       → Model accuracy: per-restaurant track record + benchmark
    (app)/setup       → setup wizard (OpenStreetMap search → profile)
    page.tsx          → front page: pick a demo kitchen
    screen/           → kitchen screen: big-type prep list for a wall tablet (English/Español, tap to mark done)
    pitch/            → the pitch deck
    api/weather       → Open-Meteo proxy (seasonal fallback if offline)
    api/places        → Nominatim restaurant search (name, address, cuisine, opening hours)
    api/geocode       → Nominatim address geocoding
  components/         → ui, charts, dashboard (incl. guide.tsx, the first-visit steps), log (incl. what-changed.tsx,
                        "What tonight taught the model"), kitchen, model, setup, landing, screen, pitch
  lib/
    prediction.ts     → priors and the 9 signals (the math, no AI)
    learning.ts       → shrunk corrections learned from close-outs; accuracy (1 − WAPE)
    uncertainty.ts    → 80% ranges from past errors (spec: .kiro/specs/forecast-confidence)
    forecast.ts       → builds a day's forecast; closed days return no forecast
    kitchens.ts       → the 3 demo kitchens: menus, CO₂e factors, hidden simulated habits
    profile.ts        → restaurant profiles (guests by weekday, open days, location)
    sim.ts            → seeded kitchen simulator (hidden "true world"); replays real Boston weather where recorded
    history-weather.json → Boston's recorded daily weather, last 92 days (Open-Meteo), read by sim.ts
    backtest.ts       → walk-forward benchmark, model versions v0–v4, 80% coverage
    effort.ts         → staff effort vs. accuracy; owner's-best-guess baseline
    history.ts        → dashboard money/CO₂e figures from stored close-outs
    track-record.ts   → per-restaurant Model accuracy (leak-free) and "What would improve accuracy" (buildActions)
    benchmarks.json   → output of `npm run bench`
    db.ts, store.tsx  → data access and app state
    pos-import.ts, opening-hours.ts, i18n.ts, i18n-screen.ts, weather.ts, categories.ts, staples.ts
  scripts/bench.ts    → regenerates lib/benchmarks.json
  scripts/fetch-history-weather.ts → refreshes lib/history-weather.json (rainy = rain/drizzle code or ≥ 2 mm)
  scripts/reseed-marco.ts → owner-only: wipes and reseeds Marco's in Supabase
  supabase/           → schema.sql, security.sql
  tests/              → unit tests + properties.test.ts (P1–P13)
```

## Prediction Engine (Core Logic — NOT an AI wrapper)
Pure TypeScript in `lib/prediction.ts` and `lib/learning.ts`.

### Design principle: almost no daily input after setup
Signals come from the calendar, the weather API, the restaurant's setup, or are learned from history. The only daily input is a quick waste log at close (tap an item, tap a portion) plus guests served.

**There is no reservation feed.** Each morning the forecast assumes the usual guests for that weekday (`coversByDay`, from setup or an imported sales CSV). The what-if slider changes it. Guests served at close-out are used for learning.

```typescript
usualPrep   = baselinePrepKg × usualCovers[weekday] / avgCovers   // weekday prep pars
baseWaste   = usualPrep × 0.08                                    // BASE_WASTE_FRACTION
forecast    = min(usualPrep × 0.5,                                // MAX_WASTE_SHARE
                  baseWaste × Π(9 signals))
plan cut    = forecast × 0.63                                     // REDUCTION_RATE, the rest is buffer
```

### The 9 signals
| # | Signal | Value | Source |
|---|---|---|---|
| 1 | Guests | `max(0.3, 1 + (1 − expected/usual) × 0.6)` | Usual weekday guests, what-if, or guests served (close-out) |
| 2 | Weather | rain/storm ×1.15, hot (≥85°F) ×0.9, cold (≤32°F or snow) ×1.08, else ×1.0; × learned weather correction | **Open-Meteo (the only live feed)**; seasonal fallback offline; manual what-if |
| 3 | Weekday habits | learned correction beyond guest count (starts 1.0) | Close-out logs |
| 4 | Season | Jan/Feb ×1.15, Mar/Apr ×1.0, May/Jun ×0.95, Jul/Aug ×0.92, Sep/Oct ×1.05, Nov/Dec ×1.2 | Calendar |
| 5 | Holiday | Thanksgiving Eve ×0.7, Dec 24–25 ×0.75, July 4 ×0.85, Jan 1 ×1.35 | Holiday calendar |
| 6 | Nearby events | game/concert ×0.78, festival/graduation ×0.82, none ×1.0 | Manual what-if only |
| 7 | Shelf life | ≤1 day ×1.2, ≤2 ×1.1, ≤4 ×1.0, ≤7 ×0.9, else ×0.8 | Set per ingredient |
| 8 | Last week, same day | recency correction (starts 1.0) | Close-out logs |
| 9 | Kitchen calibration | per-ingredient correction (starts 1.0) | Close-out logs |

Removed on purpose: the fixed industry day-of-week prior (double-counted weekday guest counts; backwards for lunch spots) and the cuisine multiplier (unsourced). Don't add them back.

### Learning (`lib/learning.ts`)
Ratio per closed-out night: r = (logged + cut) ÷ prior forecast for the guests actually served. Shrunk mean `c = (Σr + k)/(n + k)`:
- Calibration: per ingredient, last 28 days, k = 2, clamp 0.4–2.5.
- Weekday: same weekday, last 56 days, pooled across ingredients (each ratio divided by its ingredient's calibration), k = 4, clamp 0.6–1.6.
- Weather: same condition, last 56 days, pooled the same way, k = 6, clamp 0.6–1.6.
- Recency: `0.3 × (last week's ratio ÷ (calibration × weekday × weather)) + 0.7`, clamp 0.75–1.3.
- Walk-forward only: never uses the day being predicted (property P6).
- Only `overprep` and `spoiled` logs are learned from. Plate waste and drops are stored, not learned.

### Censoring (sold-out nights)
If the plan cut prep and the item logged 0, it probably sold out, so logged + cut is an **upper bound** on true waste. Those nights are flagged `censored`: they still feed learning, but are excluded from accuracy scoring, the 80% ranges (P13) and savings.

### Closed days
A closed weekday (`openDays[dow] === false` or 0 usual guests) has no forecast, no prep cut and no savings (P12). The simulator produces no rows for it.

### Cold start
Week 1 runs on priors only (signals 1, 2, 4–7). Learned corrections start at 1.0 and switch on as close-outs build up.

### Owner input summary
| Task | Frequency |
|------|-----------|
| Restaurant (OpenStreetMap search or by hand), guests by weekday, open days | Once |
| Ingredient list: cost, usual prep, shelf life | Once |
| Optional sales-CSV import for guests by weekday | Once |
| Log waste (tap item, tap portion) and guests served | Nightly, staff, about a minute |

## CO₂e and impact
- Per-kg factors: farm-to-retail emissions, Poore & Nemecek (2018), *Science*, via Our World in Data. Mapping per item is in `lib/kitchens.ts`; category defaults in `lib/categories.ts`.
- 1 meal = 1.2 lb (Feeding America). ~0.4 kg CO₂ per mile, 4.6 t CO₂ per car per year (EPA).
- Savings = cut × cost on provable nights only (cut > 0 and logged > 0). Yearly = last 30 days × 365/30. Monthly before/after bin totals are not season-adjusted.

## Database Schema (`supabase/schema.sql`)
```sql
ingredients (id, restaurant_id, name, category, cost_per_kg, baseline_prep_kg, shelf_life_days, co2_per_kg, created_at)
waste_logs (id, restaurant_id, ingredient_id, quantity_kg, reason, logged_at)
daily_observations (restaurant_id, date, ingredient_id, prior_kg, cut_kg, logged_kg, weather, covers)
```
RLS (`supabase/security.sql`): anon can read `marcos-trattoria`; writes need `public.is_admin()`.

## Demo Data Requirements
- Three demo restaurants (`lib/profile.ts`, `lib/kitchens.ts`). Marco's history lives in Supabase; Golden Crumb and Kendall are generated in the browser by the same simulator.
- History = `runBacktest(ingredients, 12, 7, today, 14, shapeOf(profile))`: 12 weeks, seed 7, plan starts on the 15th open night. Never hardcode dashboard numbers; derive them from `daily_observations` via `lib/history.ts`.
- Reset demo data (sidebar) reseeds. Owner reseed of Supabase: `scripts/reseed-marco.ts`.
- After any model change: `npm run bench` (the rescore hook does this on save) and commit `lib/benchmarks.json`.

## Performance Rules
- Page must load in under 2 seconds for the demo
- Seed demo data so the dashboard is never empty
- Forecasts are computed in the browser; no prediction endpoint

## Error Handling
- Never show raw error messages in the UI
- If the weather API fails, use the seasonal fallback week (`fallbackWeek()` in `lib/weather.ts`)
- If Supabase fails, fall back to browser storage
- Demo must work with no internet (demo history is generated locally)
