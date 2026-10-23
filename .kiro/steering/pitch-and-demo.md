# Pitch & Demo Standards — FreshCast

## The One-Line Pitch
"Restaurants throw away $162 billion in food every year. We predict waste before it happens — no hardware, no installation, 5-minute setup."

## Key Stats (verified, citable)
- $162B in US restaurant food waste annually (Forbes, March 2026)
- $1 invested in waste reduction = $7-8 returned (Champions 12.3 / WRI study, 114 restaurants, 12 countries)
- $20,800/year average loss per restaurant from waste (Alto-Shaam research)
- 4-10% of all purchased food becomes waste (Galley Solutions)
- 3-5% restaurant profit margins (GoFoodService)
- 70% of US restaurants are independent single-unit operators
- Prediction accuracy: R² of 0.817 using software-only features (arxiv.org/abs/2609.08078)

## Personal Hook (authentic — do not fabricate)
Growing up in Springfield, MA — one of the highest poverty rate cities in Massachusetts — you know what tight margins mean firsthand. You've seen restaurants in your community running on nothing, and food going in the trash represents real money they can't afford to lose. That's who FreshCast is built for. Not chains with enterprise budgets — the independent owner who's been completely ignored by every tool on the market.

## Target User
Marco. 60-seat independent Italian restaurant, Boston. One location. Uses Square POS. No data team. Can't afford Winnow's hardware. Throws away ~$1,800/month in food and has no idea.

## How the Model Gets Smarter Over Time
- Week 1 (cold start): industry baseline multipliers from published research. Already useful.
- Weeks 2-4: compares predictions vs actual logged waste. Adjusts personal multipliers per ingredient.
- Month 2+: knows this restaurant specifically — portion patterns, slow days, which dishes over-prep.
- The recency factor (last week same day actual waste) is the strongest short-term signal.
- Pitch line: "FreshCast starts accurate on day one. After two weeks, it knows Marco's kitchen better than Marco does."

## Competitor Differentiation
Winnow, Leanpath, Orbisk, Kitro all require:
- Physical hardware (camera + scale over trash bin) = $3,000-8,000 upfront
- Multi-site contracts (single restaurants often can't qualify)
- Technician installation + ongoing maintenance
- They measure waste AFTER it happens (reactive)

FreshCast:
- Software only, zero hardware
- Works on any tablet/phone the restaurant already owns
- 5-minute setup
- PREVENTS waste before it happens (proactive)
- Built specifically for the 500,000 independent restaurants everyone else ignores

## The Hardware Question (when judges ask)
"Hardware competitors need cameras and scales because they're measuring waste reactively — after it's already in the trash. We don't measure waste, we prevent it. Our prediction engine runs on data the restaurant already has: reservation count, menu, and day-of-week patterns. This approach is validated by published ML research showing R² of 0.817 on purely operational features. No hardware needed because we intervene upstream, before prep begins."

## Demo Script (Sophia's movie structure — problem → tension → solution)
1. "Meet Marco. 60-seat Italian restaurant in Boston. Last month he threw away $1,800 in food. He has no idea why." [show empty state / waste piling up]
2. "It's Sunday night. Marco checks FreshCast before ordering for the week." [open dashboard]
3. "He enters tomorrow's 45 covers. FreshCast pulls tomorrow's weather — rainy, 58°F." [watch weather load live]
4. "Instantly — predicted waste by ingredient. $84 at risk. Watch what happens when he applies the recommendations." [click button, watch red→green animation]
5. "During service, staff log waste in 2 taps. Watch the CO2 counter." [log an item, counter ticks up]
6. "Two weeks in — Marco saved $340 this week alone. $4,000 annually. FreshCast costs $49/month." [ROI screen]

Demo should take 4-5 minutes. Let the product speak — don't narrate over animations, let judges watch them.

## Pitch Deck Slide Order (from hackathon video research)
1. Problem — "Marco throws away $1,800/month and doesn't know it"
2. Evidence — $162B industry stat, profit margin squeeze, visual of waste
3. Cost of problem — per-restaurant dollar loss, industry total
4. Why existing solutions fail — hardware barrier, enterprise-only
5. Solution — FreshCast screenshot + one-liner
6. Live demo — 4+ minutes
7. Before/After — "$1,800 wasted → $340 wasted. $17,000 saved annually."
8. Market — 500,000 independent US restaurants, $49/month = $29M TAM at 1% penetration
9. How it works (technical) — prediction engine, no hardware, 5-min setup
10. Team — your story, why you built this (personal connection to cost of living)

## Q&A Preparation
- "How accurate is it?" → R² 0.817 from published research, improves weekly with restaurant's own data
- "How is this different from just asking ChatGPT?" → Core is a structured prediction engine with real math. AI only writes the explanation. The numbers come from your code.
- "What about chains?" → 70% of restaurants are independent. Chains have enterprise solutions. We own the market nobody else serves.
- "How do you make money?" → $49/month SaaS. At $20,800/year waste loss, the ROI is 35x. Sells itself.
- "Can restaurants fake the data?" → They enter their own inventory. If they lie, they get worse predictions. Incentive is to be accurate.

## Functionality Level for Hackathon
The demo needs to work end-to-end for ONE flow:
1. Log in as Marco's Trattoria (pre-seeded)
2. See tomorrow's prediction dashboard with real weather
3. Click "Apply Recommendations" and watch animation
4. Log one waste item and watch dashboard update
5. See the Smart Order recommendation screen

Everything else (onboarding, multiple restaurants, billing) can be UI-only or mocked. Judges care about the core loop working live.
