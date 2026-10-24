# FreshCast

Forecasts tomorrow's food waste for independent restaurants, per ingredient, and tells the kitchen how much less to prep. No hardware. Built solo at Hackachusetts 2026 (Climate Tech track).

## What it does
- **Forecast:** a 7-day outlook with live Boston weather (Open-Meteo). Every ingredient gets a waste forecast in kg and dollars.
- **Shows its work:** click an ingredient to see all 9 signals, their data source, and the equation behind the number.
- **What-if:** drag covers, change weather, add a nearby event; the forecast reruns instantly.
- **Two-tap logging + nightly close-out:** each close-out is stored in Supabase and refits the model for tomorrow.
- **Model accuracy:** a walk-forward benchmark of every model version, plus accuracy on the restaurant's own stored logs.

## How the model works
`lib/prediction.ts` holds industry priors for covers, weather, weekday, season, holidays, events, and cuisine. `lib/learning.ts` fits per-ingredient, per-weekday, and per-weather corrections from the kitchen's logs, with shrinkage so one odd night can't swing it. No LLM touches the numbers.

| Version | Adds | Accuracy |
|---|---|---|
| v0 | Rule of thumb (8% of prep) | 64.0% |
| v1 | Covers + weekday priors | 74.1% |
| v2 | Weather, season, holidays, events | 78.4% |
| v3 | Per-ingredient calibration from logs | 86.6% |
| v4 | Weekday, weather, and recency learning | 87.6% |
| Ceiling | Knows the true average, can't see daily randomness | ~90% |

Accuracy = 1 − weighted absolute percentage error, walk-forward, weeks 3-12, averaged over 3 simulated kitchens (`lib/sim.ts`) whose true behavior is hidden from the model. Reproduce with `npx tsx scripts/backtest.ts` inside `freshcast-app/`.

## Built with Kiro
- **Steering** (`.kiro/steering/`): project-specific rules for engineering, UI, pitch, and hackathon scope, plus the Anti-AI-UI suite (anti-slop filter, component reference, UI/UX pro max). Every screen was generated against them.
- **Hooks** (`.kiro/hooks/auto-commit-push.json`): commits and pushes on every save, so the repo history is a timeline of the build.
- **MCP** (`pptx-mcp`): generated the PowerPoint pitch deck from the same stats the app shows.
- **Research in the loop:** Kiro's web search sourced every industry stat, the competitor teardown (Winnow, Leanpath), and design references from TreeHacks winners.

## Run it
```bash
cd freshcast-app
npm install
npm run dev   # http://localhost:3000
```
Database: paste `freshcast-app/supabase/schema.sql` into the Supabase SQL Editor, then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `freshcast-app/.env.local`. Without a database the app still runs and saves to the browser.
