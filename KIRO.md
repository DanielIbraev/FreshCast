# How FreshCast was built with Kiro

FreshCast was built solo in one day in the **Kiro IDE**, mostly in Autopilot mode. Kiro did the research, the code, the tests and the deployment fixes. My job was product decisions and pushing back. Everything below is in this repo: open `.kiro/` and the git history.

## Tools
- **Kiro IDE**, the only Kiro surface used. Autopilot for building, with me reviewing every screen through headless-Chrome screenshots Kiro took itself.
- **Not used:** Kiro CLI, Web or Crew. As a solo builder in one editor, I had no handoffs to make and no parallel streams that needed them.
- **Built-in agent tools that mattered most:**
  - **Web search and fetch** sourced every statistic in the app and deck (FAO, EPA, USDA, Technomic, Galley Solutions), plus the competitor teardown and the research on how Genjutsu, Vercel and Supabase actually behave. Kiro checked these docs instead of guessing.
  - **Shell** ran builds, tests, benchmarks, and a clean-clone CI reproduction.

## Spec-driven development
- **Where:** `.kiro/specs/forecast-confidence/`, covering requirements, design and tasks.
- **When I used it vs. vibe coding:** most of the app was vibe-coded fast, with steering as guardrails. I switched to a spec for the one feature where *correctness* was the product: putting an honest 80% confidence range on every forecast. A wrong range is worse than no range.
- **How the spec is structured:**
  - **Requirements** in EARS form ("WHEN … THE SYSTEM SHALL …"), with user stories for the owner and for a skeptical technical reviewer.
  - **Design** includes a *correctness properties* table, mapping each requirement to a property that must hold for all inputs.
  - **Tasks** reference requirement numbers. Task 1 was to write the properties before the feature.
- **What it changed:**
  1. **The properties found 2 real bugs** before any new code existed (see PBT below).
  2. **The spec required proving the range is honest** (Req 3), so we measured it. The first version covered only **73.4%** of real nights, because errors were measured against forecasts rebuilt with the guest count known only at close. Recovering the forecast the kitchen actually saw that morning (from the stored prep cut) fixed it: **79.6% coverage on a nominal 80%.** A test now fails if coverage drifts outside 70–90%.

  Vibe coding would have shipped a nice-looking range that was quietly wrong.

## Agent hooks (`.kiro/hooks/`)
| Hook | Trigger | What it does |
|---|---|---|
| `auto-commit-push` | PostFileSave | Commits and pushes every save. The repo's 150+ commits are a live timeline of the build. |
| `test-on-model-save` | PostFileSave on `lib/` or `tests/` | Runs all 35 unit and property tests, so a model edit can't silently break a claim in the pitch. |
| `rescore-model` | PostFileSave on the forecasting files | Regenerates `lib/benchmarks.json` (accuracy per model version, the owner baseline, the effort study, range coverage). The dashboard, Model page and deck read that file, so their numbers can't go stale. |

**Lesson learned:** pushing on every save created 140+ commits in 24 hours, and each one triggered a Vercel deploy. That hit Vercel's 100-deploys-per-day limit. Kiro diagnosed it from the GitHub check, confirmed in Vercel's docs that ignored builds still count toward the limit, and fixed the root cause with `git.deploymentEnabled: false`. Now GitHub updates continuously and production deploys happen on purpose. The same session diagnosed a failing CI run: tests passed in a clean UTC clone but timed out on slower shared runners, so the test timeout was raised.

## Steering (`.kiro/steering/`, always on)
- **Four project files:**
  - `saas-engineering`: stack, architecture, the model's math.
  - `ui-design`: color tokens, type, components.
  - `pitch-and-demo`: verified stats with sources, the demo script, Q&A.
  - `hackathon-mindset`: scope rules, and *"commit and push after every change; update the pitch, README and deck in the same pass."*
- **Three third-party files** from [Anti-AI-UI](https://github.com/Vanszs/Anti-AI-UI) (MIT): an anti-AI-slop filter, a component reference, and a UI/UX design system.
- **Strategy that made the biggest difference:** pairing a *ban list* with a *pattern library*.
  - The anti-slop file bans the defaults AI UIs fall into: purple gradients, Inter for everything, emoji icons, glassmorphism, hype copy.
  - The component reference says what to build instead.
  - This is why the UI uses Sora and Inter, flat surfaces, one emerald accent, and real numbers everywhere.
- **Second biggest:** the rule that *every number on screen must come from code, not constants.* It forced the dashboard, impact card and deck to read from stored data, and it's why the deck can't contradict the app.

## MCP (`.kiro/settings/mcp.json`)
- **`pptx-mcp`** gives Kiro the ability to create and edit real PowerPoint files. Kiro used it to generate an editable backup `.pptx` of the pitch from the same stats.
- **Getting it running was its own debugging job:**
  - Its `cryptography` dependency failed to build because macOS had no OpenSSL.
  - Kiro pinned a version with prebuilt wheels and pointed the MCP config at the Python interpreter that had the dependencies.
- Without MCP, the deck would only have existed as a web page.

## Property-based testing (`freshcast-app/tests/properties.test.ts`, fast-check)
11 properties, 200 generated cases each:

| # | Property |
|---|---|
| P1 | The forecast is finite and never negative |
| P2 | More guests never means more waste |
| P3 | The forecast is linear in prep |
| P4 | The prep plan never asks for negative prep or more than usual |
| P5 | Learned factors stay inside their clamps |
| P6 | Observations from the target day or later never change a forecast (no leakage) |
| P7 | Calibration stays between 1.0 and the kitchen's mean (shrinkage) |
| P8 | 0 ≤ low ≤ forecast ≤ high |
| P9 | Accuracy is in [0, 1] |
| P10 | Any CSV table survives write → parse |
| P11 | Every date the importer accepts is a real calendar date |

**What PBT caught that the 21 existing unit tests had missed:**
- **P4:** for a 0.1 kg/day item, rounding made the plan recommend *more* than the usual prep. Shrunk counterexample: prep 0.1055 kg, 109 guests, calibration 0.4.
- **P11:** the sales-CSV importer accepted **2/29/2026** (2026 is not a leap year) and silently rolled it into March 1, skewing the guest pattern.

Both are fixed, with regression tests. These are exactly the edge cases people don't think to write example tests for.

## Kiro powers
Not used during the build. I checked the registry and the Supabase power fit our stack, but I set up Supabase directly (schema plus row-level-security SQL) before I knew powers existed. Next step: use the Supabase power's security advisors to audit the RLS policies.

## How Kiro shaped the strategy
- **Research before code:** Kiro pulled the winning-pitch structure from TreeHacks winners and YC's deck guidance, and tested my "beats the owner's gut" claim by *building* an owner baseline. The honest number (38% fewer misses, not "20% → 90%") replaced the one I wanted.
- **Effort vs. accuracy as an experiment:** Kiro replayed 6 staff-logging plans on 5 simulated kitchens. The data picked the default: one minute a night of quick-tap estimates. A scale costs 3x the time for 0.4 points.
- **Security as a design decision:** the public can read the demo but not write. Postgres checks an owner token through a `SECURITY DEFINER` function, and pilot sign-ups are insert-only. Kiro also caught that `.env.local` had been committed and upgraded Next.js past critical security advisories.
