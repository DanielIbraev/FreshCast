# Hackachusetts 2026 submission: FreshCast

**Track:** Climate Tech
**Team:** Daniel Ibraev (solo)
**Live app (no login needed):** https://freshcast-taupe.vercel.app
**Public repo:** https://github.com/DanielIbraev/FreshCast (includes the `.kiro/` folder)
**How Kiro was used:** [KIRO.md](KIRO.md)
**Video:** _add YouTube link_

## Text description
If food waste were a country, it would be the third-largest greenhouse-gas emitter (FAO), and food is the largest single material in US landfills, where it rots into methane (EPA). Restaurants throw away up to 10% of the food they buy (Galley Solutions), mostly because every morning someone guesses how much to prep and guesses high.

**FreshCast replaces the guess.** Each morning it tells an independent restaurant how much less of each ingredient to prep, so less food is bought, cooked and thrown out. It needs no hardware. Waste tools that put cameras and scales on the bin measure waste after it happens; FreshCast changes the prep amount before anything is cooked.

**Features**
- **Forecast per ingredient, 7 days ahead.** Waste = usual prep × 8% × 9 signals: guests vs. the usual for that weekday, live local weather (Open-Meteo, adjusted by how weather has hit this kitchen), season, holidays, nearby events (what-if), shelf life, and three corrections learned from the kitchen's own close-outs (weekday habits, last week, per-item calibration). There is no reservation feed: the morning forecast uses the restaurant's usual guests for that weekday, from setup or an imported sales CSV.
- **Shows its work.** Click an ingredient to see every signal, its source and the equation. What-if controls for guests, weather and events. **Apply prep plan** cuts 63% of the forecast waste and keeps the rest as a buffer. A first visit gets a 4-step guide that ticks off as you go (pick a day, open an ingredient's math, try a what-if, apply the plan).
- **Honest 80% ranges.** Each range is learned from that kitchen's past errors against its morning forecast. In the benchmark, 77.5–79.9% of nights land inside it.
- **About a minute of logging a night.** Tap an item, then a portion ("a bowl", "half a pan"); no scale. **English and Español.** Close-out records guests served and refits tomorrow's forecast, then shows **What tonight taught the model**: per item, tonight's actual vs. forecast kg, its calibration before → after, and tomorrow's forecast before → after.
- **Kitchen screen** (`/screen`). Today's prep list in big type for a wall tablet, English or Español; tap an item to mark it done.
- **Model accuracy page, per restaurant.** Leak-free scoring of the morning forecast against each close-out, 80% range hit rate, per-item accuracy, bias and sold-out nights. "What would improve accuracy" lists specific findings: the weakest item and the likely reason, the most improved item, weekday and rainy-night checks, items that seem to sell out, and the sales import.
- **Day 1 for a new restaurant.** The dashboard explains that forecasts run on priors until there are close-outs, and the Model page shows what nights 3, 14 and 28 unlock.
- **Three demo restaurants of different shapes**, picked from the front page: Marco's Trattoria (Italian dinner, North End), Golden Crumb Café (bakery, Davis Square) and Kendall Bowl Co. (fast-casual lunch, Kendall Square, closed Sundays). Each has its own menu and history, replayed on Boston's real recorded weather.
- **Any restaurant in a couple of minutes.** `/setup` searches OpenStreetMap to fill in name, address, cuisine and opening hours, then switches the forecast to that location's live weather.
- **Climate impact from real arithmetic.** Meals, kg and CO₂e of food not wasted, computed from close-outs. CO₂e factors from Poore & Nemecek (2018) via Our World in Data.

**Results (simulated, and labeled as such in the app).** On a 12-week walk-forward benchmark (5 seeds per restaurant, each night replayed on Boston's real recorded weather), accuracy goes from 58–67% for a rule of thumb to 84–86% with learning, against an oracle ceiling of 85–87%. That is 16–29% fewer misses than an owner who remembers exactly what was wasted on the last 4 same weekdays, and 56–62% fewer than the rule of thumb. In Marco's simulated history, the bin drops from about $1,273 to $856 a month, and the last 30 days annualize to about $12,500 of food kept out of the bin and 5.8 t CO₂e a year. If 1% of the 412,498 US independent restaurants (Technomic, 2025) saved like Marco's, that would be about 23,800 t CO₂e and 9.0 million meals' worth of food a year. The simulator shares the model's structure, so these numbers show the learning works; real accuracy needs a real kitchen, which is the next step.

**Who it's for.** Independent restaurants on 3–5% margins, which waste tools built for chains ignore, and the staff who close each night, many of them Spanish-first. It runs on the phone or tablet the kitchen already has.

**Public data used:** Open-Meteo (weather), OpenStreetMap Nominatim (restaurant search), Our World in Data / Poore & Nemecek (CO₂e per kg), Feeding America (lb per meal), EPA (CO₂ per mile and per car), Technomic (restaurant counts).

**Built with Kiro.** Kiro IDE only. A spec (`.kiro/specs/forecast-confidence/`) built the 80% ranges; the first design covered only 73% of nights and was redesigned. 13 fast-check properties found 2 bugs the example tests missed. Three active hooks (auto-commit-push, tests on model edits, automatic re-scoring). 7 steering files, the Hallmark design skill, the pptx MCP server, and parallel subagents, including a model audit that found and fixed five real problems. Full write-up with specifics: [KIRO.md](KIRO.md).

## How to test
1. Open **https://freshcast-taupe.vercel.app**. No account. You're in a sandbox: changes stay in your browser and can't affect the shared demo.
2. **Switch restaurants** in the sidebar (or add `?r=kendall-bowls`, `?r=golden-crumb`, `?r=marcos-trattoria`). Kendall shows Sunday as closed and a weekday-heavy lunch week. Golden Crumb's croissants have a 1-day shelf life, so the shelf-life signal pushes their forecast up.
3. **Forecast:** on Marco's, click a day, then **Atlantic Salmon** to see the 9 signals, their sources, the equation and the 80% range. Drag the guests slider, set weather to rain, then click **Apply prep plan**.
4. **Log waste:** switch to **Español**, tap an item, then a portion. Click **Close out today** and watch tomorrow's forecast change.
5. **Model accuracy:** the restaurant's own track record, then the benchmark (each model version, the owner baseline, effort vs. accuracy).
6. **Kitchen:** under "Guests by weekday", click **Try a sample export** to import a sample sales CSV.
7. **Set up your own restaurant** (`/setup`): search for any restaurant on OpenStreetMap.
8. **Pitch deck:** `/pitch`. Arrow keys to move, `F` for full screen.

**Run locally:** `cd freshcast-app && npm install && npm run dev`. Works without a database (saves to the browser).
**Tests:** `cd freshcast-app && ./node_modules/.bin/vitest run` (60 tests). **Benchmark:** `npm run bench` (about 20 s).
