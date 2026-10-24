# Pitch & Demo Standards — FreshCast

## Submission requirements (Hackachusetts 2026 rules)
- Text description of features and functionality: `SUBMISSION.md`.
- Track: **Climate Tech**.
- Public GitHub repo with run instructions (`README.md`) and the `.kiro/` folder.
- Working test link, no login: https://freshcast-taupe.vercel.app
- Kiro write-up: `KIRO.md` (tools, spec, hooks, steering, MCP, PBT, powers).
- Video: **under 3:00**, shows the app working, **no third-party trademarks and no copyrighted music**. Don't show vendor logos or brand names on screen; use no music or royalty-free music you have rights to.

## Judging criteria and our answer
1. **Potential Value** (real problem, scalable, accessible, equity, adoption)
   - ~70% of US restaurants are single-location independents (412,498, Technomic 2025). Waste tools that put cameras and scales on the bin are built for chains. FreshCast needs no hardware and runs on the phone or tablet the kitchen already has.
   - Accessible: about a minute of quick-tap logging a night, no scale, English and Español staff screen, setup from an OpenStreetMap search.
   - Scales by impact, not revenue: at 1% of independents, ~23,800 t CO₂e and ~9.0 million meals' worth of food a year (simulated, Marco-like savings).
2. **Implementation** (depth and variety of Kiro use, strategy, experimentation)
   - Kiro IDE only. Spec → 80% ranges (first design 73% coverage, redesigned). 13 fast-check properties found 2 bugs. 3 active hooks. 7 steering files. Hallmark skill + sloplint (rerun, 0 FAILs on the new pages). pptx MCP. Parallel subagents, including a model audit that fixed 5 real problems and a batch that built the front page, kitchen screen and Model-page actions. Details in `KIRO.md`.
   - Integrations: Open-Meteo live weather and recorded Boston weather, OpenStreetMap Nominatim, Supabase (Postgres + row-level security), the walk-forward benchmark.
3. **Quality & Design** (originality, polish, public datasets)
   - The model breakdown (every signal, its source, the equation), the what-if controls, "What tonight taught the model" after close-out, the kitchen screen, and the per-restaurant Model accuracy page with specific findings.
   - Public data: Open-Meteo (live forecast, and Boston's recorded daily weather for the last 92 days, which every simulated night and the benchmark replay), OpenStreetMap, Our World in Data (Poore & Nemecek 2018), Feeding America, EPA, Technomic.

## Track fit (Climate Tech): say this out loud
Food waste isn't named in the track bullets. Frame it:
- If food waste were a country, it would be the third-largest emitter (FAO). Food is the largest material in US landfills, where it makes methane (EPA).
- **Resilient communities:** independent restaurants run on 3–5% margins. Waste is part of the difference between staying open and closing.
- **Ocean / blue economy:** seafood (Marco's salmon, Golden Crumb's smoked salmon) has some of the highest CO₂e per kg on the menu (13.63 kg CO₂e/kg, farmed fish).

## Product facts (don't contradict these)
- **No reservation feed.** The morning forecast uses the restaurant's usual guests for that weekday (setup estimate or an imported sales CSV). The what-if slider changes it. Guests served are entered at close-out and used for learning.
- **9 signals per forecast, 1 live feed** (Open-Meteo weather). Nearby events are a manual what-if. Season and holidays come from the calendar. Shelf life is set per ingredient. Weekday habits, last week and kitchen calibration are learned.
- **No pricing.** Don't mention a price, ROI, payback, ARR or market revenue.
- **No pilot sign-up page.** Don't ask the audience to introduce an owner. The next step after the hackathon is testing in a real kitchen to measure real accuracy.
- Three fictional demo restaurants (switcher in the sidebar, or `?r=<id>`): Marco's Trattoria (`marcos-trattoria`, Italian dinner, 60 seats, North End), Golden Crumb Café (`golden-crumb`, café/bakery, 28 seats, Davis Square), Kendall Bowl Co. (`kendall-bowls`, fast-casual lunch, 40 seats, Kendall Square, closed Sundays).

## Numbers you can say
All come from code (`lib/benchmarks.json`, or each restaurant's simulated history via `lib/history.ts`). None are typed into the UI.

**Benchmark** (1 simulated kitchen per restaurant × 5 seeds: 7, 11, 23, 31, 42; 12 weeks, walk-forward, scored after 2 weeks; accuracy = 1 − WAPE by kg; each night replayed on Boston's real recorded weather from `lib/history-weather.json`, simulated weather outside that 92-day window):

| | Marco's | Golden Crumb | Kendall |
|---|---|---|---|
| v0 Rule of thumb (8% of usual prep) | 66.7% | 58.3% | 62.9% |
| v1 + Weather, season, holidays | 68.6% | 59.0% | 64.5% |
| v2 + Shelf life | 75.4% | 68.0% | 70.7% |
| v3 + Kitchen calibration | 84.6% | 82.9% | 83.2% |
| v4 + Weekday, weather, recency learning | 85.4% | 84.1% | 86.0% |
| Owner's best guess (exact memory of last 4 same weekdays) | 79.6% | 78.0% | 83.3% |
| Oracle (knows hidden habits, not tonight's guests or noise) | 86.3% | 85.3% | 87.0% |
| Nights inside the 80% range | 79.1% | 77.5% | 79.9% |
| Fewer misses than the owner (misses = 1 − accuracy) | 29% | 28% | 16% |
| Fewer misses than the rule of thumb (v4 vs. v0) | 56% | 62% | 62% |

- Say: "The simulator shares the model's structure, so this shows the learning recovers a kitchen's habits. Real accuracy needs a real kitchen." Judges respect this.
- Say: "The weather in the benchmark is the weather Boston actually had." Guests, habits and waste are still simulated.
- Effort (Marco's): quick-tap every item + guests served ≈ 1.2 min a night → 84.7%. Weighing everything ≈ 3.5 min → 85.4%.
- Don't say "20% → 90%". There is no honest 20% baseline.

**Impact** (simulated history: seed 7, plan starts night 15; savings only on provable nights; yearly = last 30 days × 365/30; monthly bin totals not season-adjusted; computed Oct 24, 2026, moves slightly with the date):

| | Marco's | Golden Crumb | Kendall |
|---|---|---|---|
| Bin per month, before → on the plan | $1,273 → $856 | $1,005 → $681 | $1,453 → $835 |
| Kept out of the bin, last 30 days | $1,031 | $790 | $1,069 |
| Per year | ~$12,538 | ~$9,617 | ~$13,007 |
| Food not wasted per year | ~1,188 kg, ~2,182 meals | ~1,684 kg, ~3,094 meals | ~3,204 kg, ~5,887 meals |
| CO₂e per year | ~5.8 t | ~4.0 t | ~14.8 t |

- Scale: 1% of 412,498 US independents ≈ 4,125 restaurants. With Marco-like savings: ~23,800 t CO₂e and ~9.0 million meals a year, about the yearly CO₂ of 5,200 cars.
- Conversions: 1 meal = 1.2 lb (Feeding America); ~0.4 kg CO₂ per mile and 4.6 t CO₂ per car per year (EPA). CO₂e = farm-to-retail emissions, Poore & Nemecek (2018), *Science*, via Our World in Data: "embodied emissions of food not bought".

**Tests:** 60 (Vitest), including 13 numbered fast-check properties (P1–P13) plus 3 for the opening-hours parser. PBT found 2 bugs (P4 rounding, P11 2/29/2026).

**Sourced industry stats:** 412,498 US independent restaurants (Technomic, 2025); up to 10% of purchased food becomes waste (Galley Solutions); 3–5% restaurant margins (GoFoodService); $162B restaurant food waste a year (Forbes, March 2026).

## Personal hook (true)
Worked at a small cafe, watched prepped food go in the trash every night, and the owner never knew what it cost him.

## The deck
- Lives at `/pitch`. Arrow keys (or click) to move, `F` full screen, `?s=N` jumps to slide N (use after the live demo), `?cut=video&cam=1` is the recording cut with a webcam-safe corner (`C` toggles it).
- The deck is pinned to Marco's. Impact numbers read from the store and accuracy from `benchmarks.json`, so prefer wiring a number over typing it. Slide order is in `app/pitch/page.tsx`.

## Video script (under 3:00; problem → solution → live demo → impact → Kiro)
1. **Problem (0:00–0:20)**, deck. The cafe story. "If food waste were a country, it would be the third-largest emitter." Every morning a cook guesses the prep and guesses high.
2. **Solution (0:20–0:35)**, deck. "FreshCast tells a restaurant each morning how much less to prep. No hardware. The math is on screen."
3. **Live demo (0:35–2:15)**, app:
   - **Kendall Bowl Co.** (`?r=kendall-bowls`, ~10 s): Sunday is closed, no forecast. The week is lunch-shaped: busy Monday to Thursday, quiet Saturday.
   - **Golden Crumb Café** (~10 s): croissants have a 1-day shelf life, so the shelf-life signal pushes them up. Its weekend brunch peaks are a different week shape again.
   - **Marco's Trattoria** (~40 s): click a day, then **Atlantic Salmon**. Walk the 9 signals: real Boston weather from Open-Meteo, usual guests for that weekday, shelf life, the learned corrections, the equation and the 80% range. "This is arithmetic, not a chatbot." Drag guests down, set weather to rain, watch the numbers move. **Apply prep plan**: red to green.
   - **Log + close-out** (~25 s): switch to Español, tap an item, tap a portion. **Close out today**, enter guests served. Tomorrow's forecast changes.
   - **Model accuracy** (~15 s): this restaurant's own track record (morning forecast vs. each close-out, 80% range hits, sold-out nights), then the v0 → v4 ladder against the owner's best guess and the oracle.
4. **Impact (2:15–2:40)**, deck. Marco's simulated bin: $1,435 → $638 a month; ~6.1 t CO₂e a year. At 1% of US independents: ~25,000 t CO₂e and ~9.5 million meals a year. Say "simulated".
5. **Kiro (2:40–2:55)**, deck Kiro slide or `.kiro/` on screen. "Built solo in the Kiro IDE: a spec for the confidence ranges, property tests that caught 2 bugs, hooks that re-score the model on every save, steering that keeps every number honest, and a subagent audit that found five real problems."

## Q&A (technical judges)
- **How accurate?** 84–86% on the simulated benchmark across the three restaurants, against an oracle ceiling of 86–87%, and 21–32% fewer misses than an owner with perfect memory of the last 4 same weekdays. Real-world accuracy is unmeasured until a real kitchen test.
- **Is the data real?** Weather and restaurant search are live. The three restaurants and their histories are simulated. Each simulated kitchen has hidden habits the model never reads; it's scored against that hidden truth. Weakness to admit first: the simulator shares the model's structure.
- **What's censoring?** Usual waste = binned + what the plan cut. If the plan cut prep and an item logged 0, it probably sold out, so binned + cut overstates true waste (an upper bound). Those nights still feed learning but are excluded from scoring, ranges and savings. The 37% buffer (`REDUCTION_RATE` 0.63) keeps sell-outs rare.
- **Where do guest counts come from? Reservations?** No reservation integration. Mornings use the usual guests for that weekday (setup estimate or a sales CSV import); the slider is a what-if; guests served at close-out feed learning.
- **Why not hardware?** Hardware measures waste after it's binned. FreshCast changes the prep amount before anything is cooked, and the kitchen's quick logs replace the camera.
- **ChatGPT wrapper?** No LLM in the numbers. Open the model breakdown: every factor, its source and the equation are on screen, and the code is `lib/prediction.ts` and `lib/learning.ts`.
- **Shrinkage?** c = (Σr + k)/(n + k): k = 2 per ingredient (28 days), 4 per weekday and 6 per weather type (56 days). One bad night can't swing tomorrow.
- **Why WAPE, not MAPE?** MAPE explodes on near-zero items like basil; WAPE weights by kg.
- **Leakage?** Walk-forward only. Property P6 checks that data from the target day or later never changes a forecast.
- **Why is the ceiling below 100%?** The oracle knows the hidden habits but not tonight's guests (σ = 15% drift from the usual) or day-to-day noise (lognormal σ = 0.12).
- **What if staff don't log?** Priors alone (v2) score 76% / 68% / 71%: better than the rule of thumb, worse than an owner with perfect memory. Logging is what gets it to 84–86%.
- **What do plate waste and drops do?** They're recorded, but only over-prep and spoilage change prep.
- Don't claim features that aren't built: reservation or POS integrations, accounts, multi-location, pricing.
