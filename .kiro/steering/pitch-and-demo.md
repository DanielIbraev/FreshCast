# Pitch & Demo Standards — FreshCast

## Judging criteria (Hackachusetts 2026) and where FreshCast answers each
1. **Potential Value**: real problem, scalable, accessible, user-friendly, meets community needs.
   - 70% of US restaurants are independent; every competitor needs $3k-8k hardware. FreshCast runs on the tablet they own.
   - Two-tap logging, one-tap staples, CO₂ filled in automatically. Owner input after setup: ~10 seconds a night.
2. **Implementation**: effective, thoughtful use of Kiro, AI dev strategies, creative integrations.
   - Show the Kiro setup on screen for 30 seconds: steering files (`.kiro/steering/`), the auto-push hook (`.kiro/hooks/`), the pptx MCP server that built the deck.
   - Integrations: Open-Meteo live weather, Supabase (Postgres + row level security), the walk-forward backtest.
   - Separate prize: **Best use of Kiro**. Submit for it.
3. **Quality and Design**: originality, intuitive UX, polish.
   - The model breakdown panel (every signal, its source, the equation) and the what-if slider are the original moments.

## Track fit (Climate Tech) — say this out loud
The track bullets are resilient communities, cleaner buildings, clean energy, ocean, blue economy. Food waste is not named. Frame it:
- Food waste is 8-10% of global greenhouse gas emissions (UNFCCC/FAO). Food in landfill makes methane.
- **Resilient communities**: independent restaurants run on 3-5% margins. Waste is the difference between staying open and closing.
- Seafood waste (salmon, shrimp) connects to the **ocean / blue economy** bullet: every kg of fish not wasted is a kg not caught.

## Numbers you can say (all come from the app, none are typed in)
- Benchmark accuracy, same simulated kitchen, 12 weeks, 3 seeds, weeks 3-12:
  v0 rule of thumb 64.0% → v1 +covers & weekday 74.1% → v2 +weather, season, events 78.4% → v3 +kitchen calibration 86.6% → v4 +weekday/weather/recency learning 87.6%. Ceiling 90% (daily randomness).
- v4 cuts forecast error 66% vs. guessing.
- Marco's stored history (84 nightly close-outs): monthly waste $1,307 before the plan → $594 now (55% less), ~$8,560 kept per year, 15x the $588/year price.
- Do NOT say 20% → 90%. A 20% baseline would be invented. 64% → 88% with a 90% ceiling is the honest version, and the ceiling makes it more credible, not less.
- Be clear the benchmark kitchen is simulated with a hidden "true" behavior the model never sees. Judges respect this; they catch fake numbers.

## Industry stats (sourced)
- $162B restaurant food waste per year (Forbes, March 2026)
- $1 invested in waste reduction returns $7-8 (Champions 12.3 / WRI, 114 sites, 12 countries)
- 4-10% of purchased food becomes waste (Galley Solutions)
- 3-5% restaurant profit margins (GoFoodService)

## Personal hook (true)
Worked at a small cafe, watched prepped food go in the trash every night, the owner never knew what it cost him.

## Demo script (problem → tension → solution, ~4 minutes, product on screen for most of it)
1. (20s) Hook: the cafe story. Ask the room: "Who has worked in a restaurant?" Hands go up.
2. (20s) Tension: Marco, 60 seats, North End. Guesses his prep every morning. $1,300 a month in the bin. Hardware tools cost more than his margin.
3. (60s) Forecast screen: real Boston weather for the week. Click Monday. Click Atlantic Salmon. Walk the 9 signals and the equation: "This is arithmetic, not a chatbot."
4. (30s) Drag the covers slider down; flip weather to Rain. Bars and dollars move live. Hit **Apply prep plan**: red to green.
5. (40s) Log waste: two taps. **Close out today**: saves to Supabase, tomorrow's forecast changes on screen.
6. (40s) Model accuracy: the v0 → v4 ladder. "Every version scored the same way. We stop at 88% because 10% of waste is random."
7. (20s) Before/after: $1,307 → $594 a month. Kept per year. 15x return.
8. (10s) Kiro: "Built solo in 12 hours with Kiro steering, hooks, and MCP."

## Q&A
- "How accurate?" → 87.6% on the benchmark, 86% on Marco's stored logs; ceiling 90%.
- "Is the data real?" → Weather is live. Marco and the benchmark kitchen are simulated; the model is scored against hidden truth it can't see. Next step: pilot with a real restaurant.
- "Why not hardware?" → Hardware measures waste after it's binned. We change the prep amount before it's cooked. The kitchen's own logs replace the camera.
- "ChatGPT wrapper?" → No LLM in the numbers. Open the model breakdown.
- "What if they don't log?" → Priors alone are 78%, still better than guessing (64%).
- Don't claim features that aren't built. Reservations integration, auth, and multi-location are next steps.
