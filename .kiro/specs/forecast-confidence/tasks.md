# Implementation tasks: Forecast confidence ranges

- [x] 1. Write the correctness properties first
  - [x] 1.1 Add fast-check and `tests/properties.test.ts` with P1–P7 and P9–P11 against existing code. _Requirements: 2.4, 4.1_
  - [x] 1.2 Run them and record anything they catch before writing new code.
  - [x] 1.3 Fix every bug the properties find, with a regression example test.

- [x] 2. Residuals and ranges (`lib/uncertainty.ts`)
  - [x] 2.1 `residuals(obs)`: walk-forward residuals by ingredient, pooled, and by day. _Requirements: 2.1, 2.4_
  - [x] 2.2 `range(...)` with own / blended / cold-start sources and the clamp. _Requirements: 1.3, 2.1, 2.2, 2.3_
  - [x] 2.3 Property P8 for `range`. _Requirements: 1.3_

- [x] 3. Wire into the forecast
  - [x] 3.1 Optional range fields on `IngredientPrediction` and `DayPrediction`.
  - [x] 3.2 `withRanges(day, R)` with a day-level total range from `byDay` residuals. _Requirements: 1.4_
  - [x] 3.3 Memoize residuals in the store and attach ranges to `today`, `week` and `selected`.

- [x] 4. Show it
  - [x] 4.1 Ingredient bars: dollar range under each forecast. _Requirements: 1.1_
  - [x] 4.2 Model breakdown: kg range, source, and night count. _Requirements: 1.2, 2.3_
  - [x] 4.3 "Waste at risk" card: likely range for the day. _Requirements: 1.4_

- [x] 5. Prove it
  - [x] 5.1 `coverage()` in the benchmark, written to `benchmarks.json`. _Requirements: 3.1_
  - [x] 5.2 Show coverage on the Model accuracy page. _Requirements: 3.2_
  - [x] 5.3 Test that coverage is within 70–90%. _Requirements: 3.3_

## Results
- Task 1.2 caught two real bugs before any new code was written:
  - **P4** found that for tiny items (0.1 kg/day) rounding could make the prep plan recommend *more* than usual prep. Fixed with a clamp; regression test added.
  - **P11** found that the sales importer accepted 2/29/2026 (not a leap year) and rolled it into March, skewing the guest pattern. Fixed with a calendar round-trip; regression test added.
- Task 5: measured coverage of the 80% range is **79.1%** for Marco's, **77.5%** for Golden Crumb and **79.9%** for Kendall (1 simulated kitchen per restaurant × 5 seeds × 12 weeks, each night on Boston's recorded weather). All three are inside the 70–90% band that Req 3.3 tests.
  - The first version scored 73.4%, because residuals were measured against forecasts rebuilt with the guest count known only at close.
  - Switching to the forecast the kitchen actually saw that morning (recovered from the stored prep cut) made the range honest.
- After the model audit, two properties were added outside this spec's original task list: **P12** (a closed day never forecasts waste, savings or a prep cut) and **P13** (sold-out, censored nights never feed the confidence ranges). Both are in `tests/properties.test.ts`.
