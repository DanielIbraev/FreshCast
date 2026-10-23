# SaaS Engineering Standards — FreshCast

## Stack
- Framework: Next.js 14 App Router (TypeScript)
- Styling: Tailwind CSS + shadcn/ui
- Animations: Framer Motion
- Charts: Recharts
- Database: Supabase (Postgres + Realtime)
- Auth: Supabase Auth
- Weather: Open-Meteo API (free, no API key required)
- Events: Ticketmaster API (free tier) for nearby event detection
- Deployment: Vercel

## Architecture Principles
- Server Components by default. Client Components only when interactivity is needed (charts, forms, real-time updates).
- API routes in `/app/api/` for external API calls (OpenAI, Open-Meteo)
- Never expose API keys in client components
- All database calls go through Supabase client, never raw SQL in components

## Project Structure
```
/app
  /dashboard        → main dashboard page
  /log              → waste logging interface
  /orders           → smart order recommendations
  /onboarding       → first-time setup flow
  /api
    /predict        → waste prediction endpoint
    /weather        → Open-Meteo proxy
    /events         → nearby events lookup endpoint
/components
  /ui               → shadcn components
  /charts           → Recharts wrappers
  /dashboard        → dashboard-specific components
/lib
  /prediction.ts    → core prediction engine (the math, no AI)
  /carbon.ts        → CO2 calculation logic
  /supabase.ts      → Supabase client
  /types.ts         → TypeScript types
/data
  /emission-factors.json   → FAO/WRAP carbon data per ingredient
  /demo-seed.ts            → Marco's Trattoria demo data
```

## Prediction Engine (Core Logic — NOT an AI wrapper)
The prediction engine lives in `/lib/prediction.ts` and runs pure TypeScript math:

```typescript
// Waste prediction formula (based on arxiv.org/abs/2609.08078)
// All multipliers are applied sequentially against the baseline prep amount

predictedWaste(ingredient, kg) =
  baselinePrepAmount
  × demandFactor(expectedCovers / avgCovers)       // more covers = less waste per ingredient
  × weatherMultiplier(forecast)                     // rain +0.15, heat -0.10, normal 1.0
  × dayOfWeekFactor[dayOfWeek]                      // Mon 1.22, Tue 1.18, Wed 1.05, Thu 1.0, Fri 0.88, Sat 0.82, Sun 0.90
  × seasonalFactor[month]                           // Jan 1.15, Apr 1.0, Jul 0.92, Oct 1.05
  × eventFactor(hasNearbyEvent)                     // game day/concert 0.75 (more customers), holiday 1.20
  × recencyFactor(lastWeekSameDayActual)            // 0.6 × (lastActual/lastPredicted) + 0.4 × 1.0
  × personalCalibration(restaurantId, ingredient)   // learned ratio after 2+ weeks of logs

// Recency factor is the strongest short-term signal:
// recencyFactor = 0.6 × (lastWeekActual / lastWeekPredicted) + 0.4 × 1.0
// Converges to restaurant's real patterns within 2-3 weeks

// Sell-through tracking (secondary signal):
// If a dish is consistently 86'd → under-prepping flag (not waste issue)
// If a dish has 5+ portions left every service → over-prep flag for those ingredients
```

Weather multipliers by condition:
- Rainy/stormy: +0.15 (fewer walk-ins, lighter dishes ordered less)
- Hot (85°F+): -0.10 (lighter dishes, higher traffic for cold items)
- Cold (below 30°F): +0.08 (comfort food orders increase)
- Normal: 1.0

This math runs entirely in your code. No AI needed for the core prediction. AI explanation layer is optional and dropped to save time/cost.

## Database Schema
```sql
restaurants (id, name, address, lat, lng, created_at)
ingredients (id, restaurant_id, name, cost_per_kg, unit)
menu_items (id, restaurant_id, name, ingredients[])
waste_logs (id, restaurant_id, ingredient_id, quantity_kg, logged_at)
predictions (id, restaurant_id, date, ingredient_id, predicted_kg, actual_kg)
covers (id, restaurant_id, date, expected, actual)
```

## Demo Data Requirements
Always seed with "Marco's Trattoria" data:
- 3 weeks of realistic waste history showing a downward trend after recommendations applied
- Tomorrow: 45 covers, rainy weather
- Prediction: $84 waste reducible to $31 with recommendations
- Running total: $1,240 saved this month, 48kg CO2 prevented

## Performance Rules
- Page must load in under 2 seconds for the demo
- Seed demo data so the dashboard is never empty
- Prediction endpoint must respond in under 3 seconds
- If OpenAI is slow, show the numbers first and stream the explanation after

## Error Handling
- Never show raw error messages in the UI
- If weather API fails, use day-of-week baseline (always have a fallback)
- If OpenAI fails, skip the explanation text — the numbers still work
- Demo must work even with no internet (seed all demo data locally)
