# Submission form answers (copy and paste)

## Explain the problem
If food waste were a country, it would be the world's third-largest greenhouse-gas emitter (FAO). Food is the largest single material in US landfills, where it rots into methane (EPA). Restaurants throw away up to 10% of the food they buy, mostly for one reason: every morning a cook guesses how much to prep, and guesses high, because running out mid-service is worse than the bin.

Independent restaurants are hit hardest. There are about 412,498 of them in the US, running on 3–5% margins. The waste tools that exist put cameras and scales on the trash can. They cost thousands, are built for chains, and only measure waste after it has already happened. Nobody helps the small kitchen prep less in the first place.

## Describe the features and functionality of your Project
FreshCast tells an independent restaurant each morning how much less of each ingredient to prep. No hardware: it runs on the phone or tablet the kitchen already has.

- **Per-ingredient forecast, 7 days ahead.** Normal waste × the day (live local weather, season, holidays, shelf life) × your kitchen (corrections learned from nightly close-outs). Click any ingredient to see every signal, its source and the equation. No LLM touches the numbers.
- **What-if and prep plan.** Change guests, weather or nearby events and watch the forecast move. "Apply prep plan" cuts 63% of the forecast waste and keeps a buffer so the kitchen doesn't run out.
- **About a minute of logging a night.** Staff tap an item, then a portion. No scale. English and Español. Close-out shows "What tonight taught the model": each item's correction before and after, and how tomorrow's forecast changed.
- **Honest 80% ranges and a per-restaurant Model accuracy page.** Each forecast is scored against that night's close-out, leak-free. The page shows the restaurant's own misses, per-item bias, sold-out nights and specific next steps.
- **Works for any kitchen.** Three demo restaurants (Italian dinner, bakery, office-lunch spot closed Sundays) each have their own menu, weather and history. Setup searches OpenStreetMap to fill in any real restaurant in minutes.
- **Built for the line.** A big-type kitchen screen for a wall tablet, a printable prep sheet, CSV download, and a sales-export importer.

**Results (simulated, labeled as such):** 84–86% accurate across the three kitchens, 16–29% fewer misses than an owner who remembers the last four same weekdays perfectly. Histories replay Boston's real recorded weather. At 1% of US independents, Marco-like savings equal about 23,800 t CO₂e and 9 million meals' worth of food a year.

Public data: Open-Meteo, OpenStreetMap, Our World in Data (Poore & Nemecek 2018), EPA, Feeding America.

## How did you use Kiro to build your project?
I built FreshCast solo, using Kiro for everything: research, planning, code, tests, docs and the pitch deck. I used the **Kiro IDE** only (not CLI, Web or Crew), and no Powers.

- **Spec-driven development.** For the 80% confidence ranges I wrote a spec in `.kiro/specs/forecast-confidence` (EARS requirements → design with correctness properties → tasks). The first design covered only 73% of nights on a nominal 80% range. The spec required measured coverage, so we caught it and redesigned errors to be measured against the morning forecast; coverage is now 77.5–79.9%. Vibe coding would have shipped the 73% version because it looked fine on screen.
- **Property-based testing.** 13 fast-check properties (62 tests total) found 2 real bugs unit tests missed: rounding made the plan recommend *more* than usual prep for tiny items, and the CSV importer accepted 2/29/2026. Both have regression tests. GitHub Actions runs them on every push.
- **Agent hooks.** Three hooks: auto-commit-and-push on save (about 300 commits), run the tests when model code changes, and re-score the benchmark when the model changes, so the app and deck can never show stale accuracy. The auto-push hook triggered so many deploys it hit Vercel's 100/day limit; Kiro diagnosed it, and I switched to a deploy hook.
- **Steering docs.** 7 files. The rule that made the biggest difference: every number on screen must come from code, never be typed in. A pitch steering file lists the only numbers allowed. Design steering (anti-AI-slop rules plus a pattern library) set the UI direction.
- **Skills.** I added the Hallmark design skill and ran its linter on the live app: 26 failures (contrast, focus rings, tracked-caps labels) down to 0.
- **Subagents.** Parallel subagents built the setup wizard, the Model accuracy page, the front page and the kitchen screen, and ran a math-and-sources audit. The audit found 5 real model errors, all fixed: closed days forecast with max waste, demo restaurants sharing one history, savings counting sold-out nights, a "reservations" signal that didn't exist, and mis-sourced CO₂ factors.
- **MCP.** A PowerPoint MCP server generated a backup deck, and Kiro's web search sourced every statistic.

Full write-up with file paths: KIRO.md in the repo.

## Additional info
- **Live app (no login):** https://freshcast-taupe.vercel.app
- **Repo:** https://github.com/DanielIbraev/FreshCast (`.kiro` folder included)
- **Track:** Climate Tech
- **Honesty note:** the three restaurants and their histories are fictional and simulated; weather and restaurant search are live. The simulator shares the model's structure, so the benchmark shows the learning works; real-world accuracy needs a real kitchen, which is the next step.
- Built solo at Hackachusetts 2026.
