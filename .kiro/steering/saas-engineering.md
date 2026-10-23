# SaaS Engineering Standards — WasteWise

## Stack
- Framework: Next.js 14 App Router (TypeScript)
- Styling: Tailwind CSS + shadcn/ui
- Animations: Framer Motion
- Charts: Recharts
- Database: Supabase (Postgres + Realtime)
- Auth: Supabase Auth
- AI layer: OpenAI GPT-4o (explanation only, not core logic)
- Weather: Open-Meteo API (free, no API key required)
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
    /explain        → OpenAI explanation endpoint
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
predictedWaste(kg) =
  baselinePrepAmount
  × demandAdjustment(covers / avgCovers)
  × weatherMultiplier(conditions)  // rain = +0.15, heat = -0.10
  × dayOfWeekFactor[dayOfWeek]     // Mon/Tue = 1.22, Fri/Sat = 0.85
  × historicalCorrection(pastLogs) // improves after 2 weeks of data
```

This math runs in your code. OpenAI is only called to generate a plain-English explanation of WHY the prediction is what it is — it receives the numbers as context and writes a sentence. This is what makes it NOT a wrapper.

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
