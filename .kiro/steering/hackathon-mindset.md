# Hackathon Build Mindset

## We are building to WIN, not to be complete

### Priority Order (never deviate from this)
1. Core demo flow works perfectly end-to-end
2. UI looks genuinely impressive (not AI slop)
3. Real data / real APIs in the demo (weather, calculations)
4. Explanation of technical depth ready for Q&A
5. Everything else

### What to cut if time is short
- Onboarding flow → hardcode Marco's restaurant, skip setup
- Multiple restaurants → built (3 demo restaurants); don't add more
- Auth/login → can be a simple hardcoded demo login
- Mobile responsive → desktop only is fine
- Error states → happy path only, demo data never errors
- Settings pages → not needed

### What can NEVER be cut
- The red→green animation when applying recommendations
- Real weather data pulling from Open-Meteo for the restaurant's location
- The CO2 counter updating when waste is logged
- Real dollar calculations (not made-up numbers)
- The before/after savings comparison

## Speed Rules
- Use shadcn/ui components, never build UI from scratch
- Seed all demo data upfront, never wait for real restaurant data
- If something takes more than 30 minutes, simplify it
- Working ugly beats perfect broken — polish after the core works
- Deploy to Vercel early and often (every major feature)

## Code Quality During Hackathon
- TypeScript types for all data structures (prevents demo-breaking bugs)
- No console.logs in production (judges sometimes look at DevTools)
- No hardcoded API keys in client code
- Comments on the prediction engine math (judges may look at code)
- Keep components under 200 lines — split if bigger

## The Demo Environment
- Have demo running on Vercel (not localhost) before presenting
- Have a backup tab open in case something crashes
- The weather should show real tomorrow's weather for Boston, MA
- All numbers should be consistent — same Marco story every time
- Practice the demo flow at least 3 times before judging

## If Something Breaks During Demo
- Stay calm, narrate what it's supposed to do
- Have screenshots as backup
- "We had a minor bug during the demo, but here's what it does..." is honest and judges respect it
- Never apologize excessively — move forward

## Keep everything in sync (standing rule)
Commit and push to GitHub after every meaningful change (the save hook covers user saves; agent edits need an explicit commit). Whenever a feature, model change, or number changes, update in the same pass:
- `.kiro/steering/pitch-and-demo.md` (numbers you can say, demo script, Q&A)
- `README.md` (accuracy table, what's real vs simulated)
- The pitch deck at `/pitch` (`components/pitch/*`). Deck numbers read from the store and benchmark, so prefer wiring a number over typing it.
Run `npx tsx scripts/backtest.ts` after any model change and copy the new accuracy table into all three.
