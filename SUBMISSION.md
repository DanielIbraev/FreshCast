# Hackachusetts submission: FreshCast

**Track:** Climate Tech
**Team:** Daniel Ibraev (solo)
**Live app:** https://freshcast-taupe.vercel.app (no login needed)
**Repo:** https://github.com/DanielIbraev/FreshCast
**How Kiro was used:** [KIRO.md](KIRO.md)
**Video:** _add YouTube link_

## Text description
If food waste were a country, it would be the third-largest greenhouse-gas emitter on Earth (FAO), and food is the #1 material in US landfills, where it rots into methane (EPA). Restaurants throw away up to 10% of the food they buy, mostly because every morning a cook *guesses* how much to prep, and guesses high.

**FreshCast replaces the guess.** Each morning it tells an independent restaurant exactly how much less of each ingredient to prep, so less food is bought, cooked and thrown out. It needs no hardware. Competing tools put cameras and scales on the trash can to measure waste *after* it happens. FreshCast prevents it before prep.

**How it works**
- **Forecast:** a waste forecast per ingredient for the next 7 days. It multiplies 9 signals: live local weather (Open-Meteo), guests from reservations or an uploaded POS sales export, weekday, season, holidays, nearby events, cuisine, and two layers learned from the kitchen's own nightly logs.
- **Shows its work:** click any ingredient to see every signal, its source, and the exact equation.
- **Honest uncertainty:** every forecast carries an 80% range learned from that kitchen's past errors. On a 12-week benchmark, real nights land inside it **79.6%** of the time.
- **One minute a night:** at close, staff tap an item, then a portion ("a bowl", "half a pan"). No scale. **The log screen works in English and Español**, on any phone. Close-out saves to Supabase and refits tomorrow's forecast.
- **Proven, not claimed:** a walk-forward benchmark scores every model version (64% → 87% accuracy, ceiling 88%) and beats an owner who remembers exactly what he threw out with **38% fewer misses**.
- **Climate impact in the product:** meals, kg, CO₂e and driving-miles saved, from real close-outs. For one restaurant: about 1,900 meals and 4 t CO₂e a year. At 1% of US independent restaurants, that's about 3,600 cars' worth of emissions a year.
- **Any restaurant in 2 minutes:** `/setup` takes a name, an address (geocoded with OpenStreetMap for local weather), a cuisine, and starter ingredients.
- **Secure by design:** the public can read the demo but never write to it (Postgres row-level security). Pilot sign-ups are insert-only. Security headers are set and Next.js is patched.

**Who benefits:** 412,498 US independent restaurants (Technomic, 2025), which run on 3–5% margins and are ignored by enterprise waste tools, plus the staff, many Spanish-first, who log at close. At $49/month it pays for itself in about two days.

## Testing instructions
1. Open **https://freshcast-taupe.vercel.app**. No account needed. You're in a sandbox: anything you change stays in your browser and can't affect the demo.
2. **Forecast:** click a day in the 7-day strip, then click an ingredient to see the 9 signals, the equation and the 80% range. Drag **Guests**, choose **Rain**, then click **Apply prep plan**.
3. **Log waste:** switch to **Español**, tap an item, then a portion. Click **Close out today** and watch tomorrow's forecast change.
4. **Kitchen:** under "Guests by weekday", click **Try a sample export** to import a sample POS CSV.
5. **Model accuracy:** version-by-version accuracy, the effort-vs-accuracy study, and range coverage.
6. **Set up your restaurant** (sidebar): enter any US address. The forecast switches to your location's live weather.
7. **Pitch deck:** `/pitch`, press F for full screen. **Pilot sign-up:** `/pilot`.

**Run locally:** `cd freshcast-app && npm install && npm run dev`. It works without a database, saving to the browser.
**Tests:** `npm test` runs 35 unit and property-based tests. **Benchmark:** `npm run bench`.
